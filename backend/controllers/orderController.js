import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
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
    if (!mongoUserId) {
      return res.status(400).json({
        success: false,
        error: "Please sign in to checkout.",
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
        phone: String(req.body?.phone || req.user.phone || "").trim(),
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
      paymentMethod:
        String(req.body?.paymentMethod || "external").trim() || "external",
      paymentStatus: "pending",
      status: "placed",
      notes: String(req.body?.notes || "").trim(),
      placedAt: new Date(),
    });

    cart.items = [];
    await cart.save();

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

