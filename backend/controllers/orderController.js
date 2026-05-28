import crypto from "crypto";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import PaymentSession from "../models/PaymentSession.js";
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
}) => {
  const udfFields = Array.from({ length: 10 }, () => "");
  const raw = [
    salt,
    status,
    ...udfFields,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
  ].join("|");

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
        name: req.user.name || "",
        email: req.user.email || "",
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

    const shippingFee = Math.max(0, Number(req.body?.shippingFee) || 0);
    const taxAmount = Math.max(0, Number(req.body?.taxAmount) || 0);
    const discountAmount = Math.max(0, Number(req.body?.discountAmount) || 0);
    const totals = computeTotals({
      items,
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
      items: items.map((item) => ({
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
  try {
    const config = getPayuConfig();
    if (!config.key || !config.salt) {
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

    if (!txnId || !status || !amount || !hash) {
      return res.status(400).json({
        success: false,
        error: "Missing PayU callback fields",
      });
    }

    if (String(payload.key || "").trim() !== config.key) {
      return res.status(400).json({
        success: false,
        error: "Invalid PayU key",
      });
    }

    const expectedHash = buildPayuResponseHash({
      salt: config.salt,
      status,
      email: String(payload.email || "").trim(),
      firstname: String(payload.firstname || "").trim(),
      productinfo: String(payload.productinfo || "").trim(),
      amount,
      txnid: txnId,
      key: config.key,
    });

    if (expectedHash.toLowerCase() !== hash.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: "PayU hash verification failed",
      });
    }

    const session = await PaymentSession.findOne({ txnId });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Payment session not found",
      });
    }

    const amountMatches =
      roundMoney(Number(amount)) === roundMoney(Number(session.total));
    if (!amountMatches) {
      session.status = "failed";
      await session.save();

      return res.status(400).json({
        success: false,
        error: "Payment amount mismatch",
      });
    }

    const returnUrl = config.returnUrl;
    const redirectResponse = (data, statusCode = 200) => {
      const redirectUrl = buildRedirectUrl(returnUrl, data);
      if (redirectUrl) {
        return res.redirect(302, redirectUrl);
      }
      return res.status(statusCode).json({
        success: data?.status === "success",
        data,
      });
    };

    if (status !== "success") {
      session.status = "failed";
      await session.save();
      return redirectResponse({ status: "failed", txnId });
    }

    session.status = "success";
    await session.save();

    let order = await Order.findOne({ paymentTransactionId: txnId });
    if (!order) {
      order = await Order.create({
        orderNumber: await createUniqueOrderNumber(),
        userId: session.userId,
        customer: session.customer,
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

    return redirectResponse({
      status: "success",
      txnId,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to process PayU callback",
      message: error.message,
    });
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
