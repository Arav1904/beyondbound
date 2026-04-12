import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createAuditLog } from "../utils/auditLog.js";

const parsePagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
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

const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const cleanIdentifierCandidate = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  const withoutParenSuffix = normalized.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return withoutParenSuffix || normalized;
};

const buildProductIdentifierCandidates = (payload = {}) => {
  const candidates = [];

  const pushIfPresent = (value) => {
    const normalized = cleanIdentifierCandidate(value);
    if (normalized) {
      candidates.push(normalized);
    }
  };

  pushIfPresent(payload.productId);
  pushIfPresent(payload.productIdentifier);
  pushIfPresent(payload.productSlug);
  pushIfPresent(payload.productName);

  return Array.from(new Set(candidates));
};

const resolveProductForPreorder = async (identifier) => {
  const normalized = String(identifier || "").trim();
  if (!normalized) {
    return null;
  }

  const filters = [{ slug: normalized }];

  if (mongoose.Types.ObjectId.isValid(normalized)) {
    filters.push({ _id: normalized });
  }

  filters.push({ name: new RegExp(`^${escapeRegex(normalized)}$`, "i") });

  const exactMatch = await Product.findOne({
    isActive: true,
    $or: filters,
  });

  if (exactMatch) {
    return exactMatch;
  }

  const normalizedSlug = slugify(normalized);
  if (!normalizedSlug || normalizedSlug === normalized) {
    return null;
  }

  const slugPrefixRegex = new RegExp(`^${escapeRegex(normalizedSlug)}(?:-|$)`, "i");
  return Product.findOne({
    isActive: true,
    $or: [{ slug: normalizedSlug }, { slug: slugPrefixRegex }],
  }).sort({ updatedAt: -1 });
};

const resolveProductWithFallbackIdentifier = async (identifier) => {
  const direct = await resolveProductForPreorder(identifier);
  if (direct) {
    return direct;
  }

  const normalized = String(identifier || "").trim();
  if (!/-\d+$/.test(normalized)) {
    return null;
  }

  const trimmedIdentifier = normalized.replace(/-\d+$/, "");
  if (!trimmedIdentifier) {
    return null;
  }

  return resolveProductForPreorder(trimmedIdentifier);
};

const resolveOrderItem = (product, requestedSize, requestedQuantity) => {
  const quantity = toPositiveInt(requestedQuantity, 1);
  const normalizedSize = String(requestedSize || "").trim();
  const packSizes = Array.isArray(product.packSizes) ? product.packSizes : [];
  const matchedPack = packSizes.find((pack) => String(pack.value || "") === normalizedSize);

  const price = Number(matchedPack?.price ?? product.price ?? 0);
  const image = Array.isArray(product.images) && product.images.length > 0
    ? String(product.images[0] || "")
    : "";

  return {
    productId: String(product._id),
    productName: matchedPack ? `${product.name} (${matchedPack.label})` : String(product.name || ""),
    size: matchedPack ? String(matchedPack.value || "") : normalizedSize,
    quantity,
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    image,
  };
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
  country: String(address?.country || fallback?.country || "India").trim() || "India",
});

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
  placedAt: order.placedAt,
  requestedAt: order.placedAt,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export const placeOrder = async (req, res) => {
  try {
    const mongoUserId = toMongoObjectId(req.userId);
    if (!mongoUserId) {
      return res.status(400).json({
        success: false,
        error: "Cart checkout is unavailable for this session. Use the preorder form flow.",
      });
    }

    const cart = await Cart.findOne({ userId: mongoUserId });

    if (!cart || cart.items.length === 0) {
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
        phone: req.user.phone || "",
        address: normalizeAddress(req.body?.address, req.user.address),
      },
      items: cart.items.map((item) => ({
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
      paymentMethod: String(req.body?.paymentMethod || "external").trim() || "external",
      paymentStatus: "pending",
      status: "preorder_requested",
      notes: String(req.body?.notes || "").trim(),
      placedAt: new Date(),
    });

    cart.items = [];
    await cart.save();

    await createAuditLog({
      req,
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "order.preorder_requested",
      entityType: "order",
      entityId: order._id,
      metadata: {
        orderNumber: order.orderNumber,
        itemCount: order.items.length,
        total: order.total,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Pre-order request submitted successfully",
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

export const getMyOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const status = String(req.query.status || "").trim();

    const filter = {};
    const mongoUserId = toMongoObjectId(req.userId);

    if (mongoUserId) {
      filter.userId = mongoUserId;
    } else {
      const email = String(req.user?.email || "").trim().toLowerCase();
      if (!email) {
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

      filter["customer.email"] = email;
    }

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

export const placePreorderFromForm = async (req, res) => {
  try {
    const productIdentifiers = buildProductIdentifierCandidates(req.body);

    if (productIdentifiers.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Product is required",
      });
    }

    let product = null;
    for (const identifier of productIdentifiers) {
      product = await resolveProductWithFallbackIdentifier(identifier);
      if (product) {
        break;
      }
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found. Please refresh and select the product again.",
      });
    }

    if (product.isPreorderEnabled === false) {
      return res.status(409).json({
        success: false,
        error: "Pre-order is currently disabled for this product",
      });
    }

    const customerName = String(req.body?.name || req.user?.name || "").trim();
    const customerEmail = String(req.body?.email || req.user?.email || "")
      .trim()
      .toLowerCase();
    const customerPhone = String(req.body?.phone || req.user?.phone || "").trim();

    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and phone are required",
      });
    }

    const customerAddress = normalizeAddress(req.body?.address, req.user?.address);
    const item = resolveOrderItem(product, req.body?.size, req.body?.quantity);
    const mongoUserId = toMongoObjectId(req.userId);

    const order = await Order.create({
      orderNumber: await createUniqueOrderNumber(),
      userId: mongoUserId,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
      },
      items: [item],
      shippingFee: Math.max(0, Number(req.body?.shippingFee) || 0),
      taxAmount: Math.max(0, Number(req.body?.taxAmount) || 0),
      discountAmount: Math.max(0, Number(req.body?.discountAmount) || 0),
      paymentMethod: "external",
      paymentStatus: "pending",
      status: "preorder_requested",
      notes: String(req.body?.notes || "").trim(),
      placedAt: new Date(),
    });

    await createAuditLog({
      req,
      actorId: mongoUserId,
      actorEmail: customerEmail,
      action: "order.preorder_form_requested",
      entityType: "order",
      entityId: order._id,
      metadata: {
        orderNumber: order.orderNumber,
        productId: item.productId,
        quantity: item.quantity,
        total: order.total,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Pre-order submitted successfully",
      data: toPublicOrder(order),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to submit preorder form",
      message: error.message,
    });
  }
};
