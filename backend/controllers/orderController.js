import crypto from "crypto";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import PaymentSession from "../models/PaymentSession.js";
import Product from "../models/Product.js";
import { createAuditLog } from "../utils/auditLog.js";
import { notifyOrderPlacedWebhook } from "../utils/orderConfirmationWebhook.js";

const parsePagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 20),
  );
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const toMongoObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
};

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(100000 + Math.random() * 900000);
  return `BB-${year}${month}${day}-${random}`;
};

const createUniqueOrderNumber = async () => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const orderNumber = generateOrderNumber();
    const exists = await Order.exists({ orderNumber });
    if (!exists) {
      return orderNumber;
    }
  }

  throw new Error("Could not generate unique order number");
};

const normalizeAddress = (address, fallback = {}) => ({
  line1: String(address?.line1 || fallback?.line1 || "").trim(),
  line2: String(address?.line2 || fallback?.line2 || "").trim(),
  city: String(address?.city || fallback?.city || "").trim(),
  state: String(address?.state || fallback?.state || "").trim(),
  postalCode: String(address?.postalCode || fallback?.postalCode || "").trim(),
  country:
    String(address?.country || fallback?.country || "India").trim() || "India",
});

const normalizeOrderItems = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const productId = String(item?.productId || item?.id || "").trim();
      const productName = String(item?.productName || item?.name || "").trim();
      if (!productId || !productName) {
        return null;
      }

      const quantity = toPositiveInt(item?.quantity, 1);
      const price = Number(item?.price ?? 0);

      return {
        productId,
        productName,
        size: String(item?.size || "").trim(),
        quantity,
        price: Number.isFinite(price) && price >= 0 ? price : 0,
        image: String(item?.image || "").trim(),
      };
    })
    .filter(Boolean);
};

const toNonNegativeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const getSizeTokens = (value) => {
  const raw = String(value || "").trim();
  const numericMatch = raw.match(/\d+/u);

  return {
    raw,
    numeric: numericMatch ? String(numericMatch[0]) : "",
  };
};

const buildProductIdentifierCandidates = (item = {}) => {
  const candidates = [];
  const add = (value) => {
    const normalized = String(value || "").trim();
    if (!normalized || candidates.includes(normalized)) {
      return;
    }
    candidates.push(normalized);
  };

  const productId = String(item.productId || item.id || "").trim();
  const sizeTokens = getSizeTokens(item.size);

  add(productId);

  if (productId && sizeTokens.raw) {
    const suffix = `-${sizeTokens.raw}`;
    if (productId.toLowerCase().endsWith(suffix.toLowerCase())) {
      add(productId.slice(0, -suffix.length));
    }
  }

  if (productId && sizeTokens.numeric) {
    const suffix = `-${sizeTokens.numeric}`;
    if (productId.toLowerCase().endsWith(suffix.toLowerCase())) {
      add(productId.slice(0, -suffix.length));
    }
  }

  if (productId) {
    const withoutTrailingSize = productId.replace(/-\d+$/u, "");
    if (withoutTrailingSize !== productId) {
      add(withoutTrailingSize);
    }
  }

  return candidates;
};

const resolvePackPrice = (product, sizeTokens) => {
  const packSizes = Array.isArray(product?.packSizes) ? product.packSizes : [];

  if (!sizeTokens?.raw && !sizeTokens?.numeric) {
    return null;
  }

  const match =
    packSizes.find(
      (pack) => String(pack?.value || "").trim() === sizeTokens.raw,
    ) ||
    packSizes.find(
      (pack) => String(pack?.value || "").trim() === sizeTokens.numeric,
    );

  if (!match) {
    return null;
  }

  return toNonNegativeNumber(match.price, null);
};

const repriceOrderItems = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return items;
  }

  const cache = new Map();

  const resolveProduct = async (identifier) => {
    if (!identifier) {
      return null;
    }

    if (cache.has(identifier)) {
      return cache.get(identifier);
    }

    const filters = [{ slug: identifier }, { sku: identifier }];
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      filters.push({ _id: identifier });
    }

    const product = await Product.findOne({
      isActive: true,
      $or: filters,
    });

    cache.set(identifier, product || null);
    return product || null;
  };

  const updated = [];

  for (const item of items) {
    const sizeTokens = getSizeTokens(item?.size);
    const identifiers = buildProductIdentifierCandidates(item);
    let product = null;

    for (const identifier of identifiers) {
      // eslint-disable-next-line no-await-in-loop
      product = await resolveProduct(identifier);
      if (product) {
        break;
      }
    }

    if (!product) {
      updated.push(item);
      continue;
    }

    const packPrice = resolvePackPrice(product, sizeTokens);
    const nextPrice =
      packPrice !== null
        ? packPrice
        : toNonNegativeNumber(product.price, item.price);

    updated.push({
      ...item,
      price: nextPrice,
    });
  }

  return updated;
};

const roundMoney = (value) =>
  Number(Number.isFinite(value) ? value.toFixed(2) : "0.00");

const summarizeItems = (items = []) =>
  items
    .map((item) => `${item.productName}${item.size ? ` (${item.size})` : ""}`)
    .join(", ")
    .slice(0, 100);

const computeTotals = ({
  items = [],
  shippingFee = 0,
  taxAmount = 0,
  discountAmount = 0,
}) => {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const total = roundMoney(subtotal + shippingFee + taxAmount - discountAmount);
  return {
    subtotal,
    total,
    shippingFee: roundMoney(shippingFee),
    taxAmount: roundMoney(taxAmount),
    discountAmount: roundMoney(discountAmount),
  };
};

const getPayuConfig = () => {
  const env = String(process.env.PAYU_ENV || "test")
    .trim()
    .toLowerCase();
  const baseUrl =
    process.env.PAYU_BASE_URL ||
    (env === "production"
      ? "https://secure.payu.in/_payment"
      : "https://sandboxsecure.payu.in/_payment");

  return {
    key: String(process.env.PAYU_MERCHANT_KEY || "").trim(),
    salt: String(process.env.PAYU_MERCHANT_SALT || "").trim(),
    callbackUrl: String(process.env.PAYU_CALLBACK_URL || "").trim(),
    returnUrl: String(process.env.PAYU_RETURN_URL || "").trim(),
    baseUrl,
  };
};

const buildPayuHash = ({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf = [],
  salt,
}) => {
  const udfFields = Array.from({ length: 10 }, (_, index) =>
    String(udf[index] || ""),
  );
  const raw = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    ...udfFields,
    salt,
  ].join("|");

  return crypto.createHash("sha512").update(raw).digest("hex");
};

const buildPayuResponseHash = ({
  salt,
  status,
  email,
  firstname,
  productinfo,
  amount,
  txnid,
  key,
  additionalCharges = "",
  // UDF fields echoed back by PayU — we send them all empty so they're all ""
  udf1 = "",
  udf2 = "",
  udf3 = "",
  udf4 = "",
  udf5 = "",
}) => {
  // PayU response hash (reverse hash) exact formula per PayU docs:
  // sha512(additionalCharges|SALT|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
  //
  // - additionalCharges is ONLY prepended when it is present in the PayU response
  // - udf6–udf10 are always empty placeholders (6 pipe delimiters = 5 empty strings)
  // - udf5→udf1 are in REVERSE order (opposite of the request hash)
  const parts = [
    // additionalCharges goes first — only if present/non-empty
    ...(additionalCharges ? [additionalCharges] : []),
    salt,
    status,
    // udf10, udf9, udf8, udf7, udf6 — always empty, but pipe delimiters required
    "",  // udf10
    "",  // udf9
    "",  // udf8
    "",  // udf7
    "",  // udf6
    // udf5 → udf1 in REVERSE order
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
  ];

  const raw = parts.join("|");
  return crypto.createHash("sha512").update(raw).digest("hex");
};

const buildRedirectUrl = (baseUrl, params) => {
  if (!baseUrl) {
    return "";
  }

  try {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }
      url.searchParams.set(key, String(value));
    });
    return url.toString();
  } catch {
    return "";
  }
};

const toPayuMetadata = (payload = {}) => ({
  status: String(payload.status || ""),
  unmappedstatus: String(payload.unmappedstatus || ""),
  error: String(payload.error || ""),
  errorMessage: String(payload.error_Message || payload.error_message || ""),
  bankRefNum: String(payload.bank_ref_num || ""),
  mode: String(payload.mode || ""),
  pgType: String(payload.PG_TYPE || payload.pg_type || ""),
  mihpayid: String(payload.mihpayid || ""),
  payuMoneyId: String(payload.payuMoneyId || ""),
});

const backfillCustomerFromPayu = (customer = {}, payload = {}) => {
  const safeCustomer = customer && typeof customer === "object" ? customer : {};
  const safeAddress =
    safeCustomer.address && typeof safeCustomer.address === "object"
      ? safeCustomer.address
      : { country: "India" };

  const nextName = String(safeCustomer.name || "").trim();
  const nextEmail = String(safeCustomer.email || "").trim();
  const nextPhone = String(safeCustomer.phone || "").trim();

  return {
    ...safeCustomer,
    name: nextName || String(payload.firstname || "").trim(),
    email: (nextEmail || String(payload.email || "").trim()).toLowerCase(),
    phone: nextPhone || String(payload.phone || "").trim(),
    address: normalizeAddress(safeAddress),
  };
};

const toPublicStatusHistory = (statusHistory = []) => {
  if (!Array.isArray(statusHistory)) {
    return [];
  }

  return statusHistory
    .map((entry) => ({
      status: String(entry?.status || "").trim(),
      note: String(entry?.note || "").trim(),
      at: entry?.at || null,
    }))
    .filter((entry) => entry.status);
};

const buildMyOrdersFilter = (req) => {
  const mongoUserId = toMongoObjectId(req.userId);

  if (mongoUserId) {
    return {
      userId: mongoUserId,
    };
  }

  const email = String(req.user?.email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return null;
  }

  return {
    "customer.email": email,
  };
};

const toPublicOrder = (order) => ({
  id: order._id,
  orderNumber: order.orderNumber,
  userId: order.userId,
  customer: order.customer,
  items: order.items,
  subtotal: order.subtotal,
  shippingFee: order.shippingFee,
  taxAmount: order.taxAmount,
  discountAmount: order.discountAmount,
  total: order.total,
  status: order.status,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  trackingNumber: order.trackingNumber,
  estimatedDeliveryDate: order.estimatedDeliveryDate,
  statusHistory: toPublicStatusHistory(order.statusHistory),
  placedAt: order.placedAt,
  requestedAt: order.placedAt,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export const placeOrder = async (req, res) => {
  try {
    const mongoUserId = toMongoObjectId(req.userId);

    let items = [];
    let cart = null;

    if (mongoUserId) {
      cart = await Cart.findOne({ userId: mongoUserId });
      items = Array.isArray(cart?.items) ? cart.items : [];
    } else {
      items = normalizeOrderItems(req.body?.items);
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Your cart is empty",
      });
    }

    const shippingFee = Math.max(0, Number(req.body?.shippingFee) || 0);
    const taxAmount = Math.max(0, Number(req.body?.taxAmount) || 0);
    const discountAmount = Math.max(0, Number(req.body?.discountAmount) || 0);

    const order = await Order.create({
      orderNumber: await createUniqueOrderNumber(),
      userId: mongoUserId,
      customer: {
        name: String(req.body?.name || req.user?.name || "").trim(),
        email: String(req.body?.email || req.user?.email || "").trim(),
        phone: String(req.body?.phone || req.user.phone || "").trim(),
        address: normalizeAddress(req.body?.address, req.user.address),
      },
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      shippingFee,
      taxAmount,
      discountAmount,
      paymentMethod:
        String(req.body?.paymentMethod || "external").trim() || "external",
      paymentStatus: "pending",
      status: "placed",
      notes: String(req.body?.notes || "").trim(),
      placedAt: new Date(),
    });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    await createAuditLog({
      req,
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "order.placed",
      entityType: "order",
      entityId: order._id,
      metadata: {
        orderNumber: order.orderNumber,
        itemCount: order.items.length,
        total: order.total,
      },
    });

    await notifyOrderPlacedWebhook(order, {
      sourceEndpoint: "/api/orders/place",
      flow: "checkout",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: toPublicOrder(order),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to place order",
      message: error.message,
    });
  }
};

export const initiatePayuPayment = async (req, res) => {
  try {
    if (!req.userId || !req.user) {
      return res.status(401).json({
        success: false,
        error: "Sign in required to start payment",
      });
    }

    const config = getPayuConfig();
    if (!config.key || !config.salt || !config.callbackUrl) {
      return res.status(500).json({
        success: false,
        error: "PayU is not configured on the server",
      });
    }

    const mongoUserId = toMongoObjectId(req.userId);

    let items = [];
    if (mongoUserId) {
      const cart = await Cart.findOne({ userId: mongoUserId });
      items = Array.isArray(cart?.items) ? cart.items : [];
    }

    if (items.length === 0) {
      items = normalizeOrderItems(req.body?.items);
    }

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Your cart is empty",
      });
    }

    const pricedItems = await repriceOrderItems(items);
    const shippingFee = Math.max(0, Number(req.body?.shippingFee) || 0);
    const taxAmount = Math.max(0, Number(req.body?.taxAmount) || 0);
    const discountAmount = Math.max(0, Number(req.body?.discountAmount) || 0);
    const totals = computeTotals({
      items: pricedItems,
      shippingFee,
      taxAmount,
      discountAmount,
    });

    const customer = {
      name: String(req.body?.name || req.user?.name || "").trim(),
      email: String(req.body?.email || req.user?.email || "").trim(),
      phone: String(req.body?.phone || req.user?.phone || "").trim(),
      address: normalizeAddress(req.body?.address, req.user?.address),
    };

    const requiredCustomerFields = [
      customer.name,
      customer.email,
      customer.phone,
      customer.address.line1,
      customer.address.city,
      customer.address.state,
      customer.address.postalCode,
    ].map((value) => String(value || "").trim());

    if (requiredCustomerFields.some((value) => value.length === 0)) {
      return res.status(400).json({
        success: false,
        error: "Missing required customer fields",
      });
    }

    const txnId = `BB${Date.now()}${Math.floor(Math.random() * 1e6)
      .toString()
      .padStart(6, "0")}`;
    const ttlMinutes = toPositiveInt(process.env.PAYU_SESSION_TTL_MINUTES, 30);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const session = await PaymentSession.create({
      txnId,
      userId: mongoUserId,
      customer,
      items: pricedItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      currency: "INR",
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      total: totals.total,
      notes: String(req.body?.notes || "").trim(),
      returnUrl: config.returnUrl,
      expiresAt,
    });

    const productInfo = summarizeItems(session.items) || "Beyond Bound Order";
    const amount = totals.total.toFixed(2);
    const hash = buildPayuHash({
      key: config.key,
      txnid: txnId,
      amount,
      productinfo: productInfo,
      firstname: customer.name,
      email: customer.email,
      udf: [],
      salt: config.salt,
    });

    return res.status(200).json({
      success: true,
      data: {
        action: config.baseUrl,
        fields: {
          key: config.key,
          txnid: txnId,
          amount,
          productinfo: productInfo,
          firstname: customer.name,
          email: customer.email,
          phone: customer.phone,
          surl: config.callbackUrl,
          furl: config.callbackUrl,
          hash,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to initiate payment",
      message: error.message,
    });
  }
};

export const handlePayuCallback = async (req, res) => {
  const config = getPayuConfig();

  // Helper: redirect browser to the SPA that created this session (local or prod).
  // Prefer the returnUrl baked into the PaymentSession over the server's own config,
  // so a session created by the local dev backend redirects back to localhost:5173.
  const getReturnUrl = (session) =>
    String(session?.returnUrl || "").trim() || config.returnUrl;

  const redirectToFrontend = (data, session = null, httpStatus = 302) => {
    const returnUrl = getReturnUrl(session);
    const redirectUrl = buildRedirectUrl(returnUrl, data);
    if (redirectUrl) {
      return res.redirect(httpStatus, redirectUrl);
    }
    return res.status(data?.status === "success" ? 200 : 400).json({
      success: data?.status === "success",
      data,
    });
  };

  try {
    if (!config.key || !config.salt) {
      // Config error — can't redirect safely, return JSON for server-side debugging
      return res.status(500).json({
        success: false,
        error: "PayU is not configured on the server",
      });
    }

    const payload = req.body || {};
    const txnId = String(payload.txnid || "").trim();
    const status = String(payload.status || "")
      .trim()
      .toLowerCase();
    const amount = String(payload.amount || "").trim();
    const hash = String(payload.hash || "").trim();

    // Missing required fields from PayU
    if (!txnId || !status || !amount || !hash) {
      return redirectToFrontend({ status: "failed", txnId: txnId || "" }, null);
    }

    // Merchant key mismatch — possible spoofing
    if (String(payload.key || "").trim() !== config.key) {
      return redirectToFrontend({ status: "failed", txnId }, null);
    }

    // Verify PayU response hash.
    // Formula (per PayU docs):
    // sha512(additionalCharges|SALT|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    //
    // IMPORTANT: Use field values EXACTLY as received from PayU — do NOT trim.
    // PayU computes its hash server-side before sending. Even a trailing space in
    // productinfo will cause a mismatch if we trim the value here.
    const additionalCharges = String(payload.additionalCharges || "");

    const expectedHash = buildPayuResponseHash({
      salt: config.salt,
      status,
      email: String(payload.email || ""),       // no trim — use exactly as received
      firstname: String(payload.firstname || ""), // no trim
      productinfo: String(payload.productinfo || ""), // no trim — may have trailing space
      amount,
      txnid: txnId,
      key: config.key,
      additionalCharges,
      // PayU echoes back whatever UDFs we sent — use exact values from payload
      udf1: String(payload.udf1 || ""),
      udf2: String(payload.udf2 || ""),
      udf3: String(payload.udf3 || ""),
      udf4: String(payload.udf4 || ""),
      udf5: String(payload.udf5 || ""),
    });

    // Debug log in development to diagnose hash mismatches
    if (process.env.NODE_ENV !== "production") {
      console.log("[payu/callback] Received payload:", {
        txnid: txnId,
        status,
        amount,
        additionalCharges,
        email: payload.email,
        firstname: payload.firstname,
        productinfo: payload.productinfo,
        key: payload.key,
        udf1: payload.udf1,
        udf2: payload.udf2,
        udf3: payload.udf3,
        udf4: payload.udf4,
        udf5: payload.udf5,
        receivedHash: hash,
        expectedHash,
        hashMatch: expectedHash.toLowerCase() === hash.toLowerCase(),
      });
    }

    if (expectedHash.toLowerCase() !== hash.toLowerCase()) {
      console.error("[payu/callback] Hash mismatch — check that all fields are used without trimming");
      return redirectToFrontend({ status: "failed", txnId }, null);
    }

    const session = await PaymentSession.findOne({ txnId });
    if (!session) {
      // No matching session — cannot link to an order, redirect to failure
      return redirectToFrontend({ status: "failed", txnId }, null);
    }

    const amountMatches =
      roundMoney(Number(amount)) === roundMoney(Number(session.total));
    if (!amountMatches) {
      session.status = "failed";
      await session.save();
      return redirectToFrontend({ status: "failed", txnId }, session);
    }

    if (status !== "success") {
      session.status = "failed";
      await session.save();
      return redirectToFrontend({ status: "failed", txnId }, session);
    }

    session.status = "success";
    await session.save();

    let order = await Order.findOne({ paymentTransactionId: txnId });
    if (!order) {
      const customer = backfillCustomerFromPayu(session.customer, payload);

      order = await Order.create({
        orderNumber: await createUniqueOrderNumber(),
        userId: session.userId,
        customer,
        items: session.items,
        shippingFee: session.shippingFee,
        taxAmount: session.taxAmount,
        discountAmount: session.discountAmount,
        paymentMethod: "payu",
        paymentGateway: "payu",
        paymentTransactionId: txnId,
        paymentReference: String(
          payload.mihpayid || payload.payuMoneyId || "",
        ).trim(),
        paymentMetadata: toPayuMetadata(payload),
        paymentStatus: "paid",
        status: "placed",
        notes: session.notes,
        placedAt: new Date(),
      });

      if (session.userId) {
        const cart = await Cart.findOne({ userId: session.userId });
        if (cart) {
          cart.items = [];
          await cart.save();
        }
      }

      await createAuditLog({
        req,
        actorId: session.userId,
        actorEmail: session.customer?.email,
        action: "order.placed",
        entityType: "order",
        entityId: order._id,
        metadata: {
          orderNumber: order.orderNumber,
          itemCount: order.items.length,
          total: order.total,
        },
      });

      await notifyOrderPlacedWebhook(order, {
        sourceEndpoint: "/api/orders/payu/callback",
        flow: "payu",
      });
    }

    return redirectToFrontend({
      status: "success",
      txnId,
      orderId: order._id,
      orderNumber: order.orderNumber,
    }, session);
  } catch (error) {
    // Unexpected server error — redirect to failure page so user isn't stuck
    console.error("[payu/callback] Unhandled error:", error);
    return redirectToFrontend({ status: "failed", txnId: "" }, null);
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const status = String(req.query.status || "").trim();

    const ownershipFilter = buildMyOrdersFilter(req);
    if (!ownershipFilter) {
      return res.status(200).json({
        success: true,
        count: 0,
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 1,
        },
        data: [],
      });
    }

    const filter = {
      ...ownershipFilter,
    };

    if (status) {
      filter.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      },
      data: orders.map(toPublicOrder),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
      message: error.message,
    });
  }
};

export const getMyOrderById = async (req, res) => {
  try {
    const orderId = String(req.params.orderId || "").trim();
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order id is required",
      });
    }

    const ownershipFilter = buildMyOrdersFilter(req);
    if (!ownershipFilter) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    let identifierFilter = { orderNumber: orderId };
    const orderObjectId = toMongoObjectId(orderId);
    if (orderObjectId) {
      identifierFilter = {
        $or: [{ _id: orderObjectId }, { orderNumber: orderId }],
      };
    }

    const order = await Order.findOne({
      ...ownershipFilter,
      ...identifierFilter,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: toPublicOrder(order),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch order",
      message: error.message,
    });
  }
};
