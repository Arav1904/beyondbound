import mongoose from "mongoose";
import AuditLog from "../models/AuditLog.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import SupportTicket from "../models/SupportTicket.js";
import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";
import { createAuditLog } from "../utils/auditLog.js";

const USER_ROLES = ["user", "admin"];
const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "preorder_requested",
  "preorder_confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];
const PENDING_ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "preorder_requested",
  "preorder_confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const TESTIMONIAL_STATUSES = ["pending", "approved", "rejected"];
const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"];
const TICKET_PRIORITIES = ["low", "medium", "high"];

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

const parseBooleanQuery = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return null;
};

const toNonNegativeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const buildDefaultPackSizes = (price) => {
  const primaryPrice = toNonNegativeNumber(price, 1925);

  return [
    {
      value: "60",
      label: "60 Capsules",
      price: primaryPrice,
    },
    {
      value: "20",
      label: "20 Capsules",
      price: 600,
    },
  ];
};

const parsePackSizes = (value, fallbackPrice) => {
  if (!Array.isArray(value)) {
    return buildDefaultPackSizes(fallbackPrice);
  }

  const parsed = value
    .map((item) => ({
      value: String(item?.value || "").trim(),
      label: String(item?.label || "").trim(),
      price: toNonNegativeNumber(item?.price, -1),
    }))
    .filter((item) => item.value && item.label && item.price >= 0);

  if (parsed.length === 0) {
    return buildDefaultPackSizes(fallbackPrice);
  }

  return parsed;
};

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toRegex = (value) => new RegExp(escapeRegex(value), "i");

const parseDateRange = (range) => {
  const normalized = String(range || "30d").toLowerCase();
  const now = new Date();
  const start = new Date(now);

  if (normalized === "7d") {
    start.setDate(start.getDate() - 7);
  } else if (normalized === "90d") {
    start.setDate(start.getDate() - 90);
  } else if (normalized === "365d") {
    start.setDate(start.getDate() - 365);
  } else {
    start.setDate(start.getDate() - 30);
  }

  return start;
};

const formatPagination = (page, limit, totalCount) => ({
  page,
  limit,
  totalCount,
  totalPages: Math.max(1, Math.ceil(totalCount / limit)),
});

const normalizeAddressSnapshot = (address = {}) => ({
  line1: String(address?.line1 || "").trim(),
  line2: String(address?.line2 || "").trim(),
  city: String(address?.city || "").trim(),
  state: String(address?.state || "").trim(),
  postalCode: String(address?.postalCode || "").trim(),
  country: String(address?.country || "").trim(),
});

const toMongoObjectIdOrNull = (value) => {
  const normalized = String(value || "").trim();
  if (!mongoose.Types.ObjectId.isValid(normalized)) {
    return null;
  }

  return new mongoose.Types.ObjectId(normalized);
};

export const getAdminOverview = async (_req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalOrders,
      pendingOrders,
      pendingTestimonials,
      approvedTestimonials,
      openTickets,
      activeProducts,
      lowStockProducts,
      recentUsers,
      recentOrders,
      recentTickets,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "admin" }),
      Order.countDocuments({}),
      Order.countDocuments({ status: { $in: PENDING_ORDER_STATUSES } }),
      Testimonial.countDocuments({ status: "pending" }),
      Testimonial.countDocuments({ status: "approved" }),
      SupportTicket.countDocuments({
        status: { $in: ["open", "in_progress"] },
      }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ inventory: { $lte: 10 }, isActive: true }),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role isActive createdAt"),
      Order.find({})
        .sort({ placedAt: -1 })
        .limit(5)
        .select("orderNumber customer total status placedAt"),
      SupportTicket.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("ticketNumber subject status priority createdAt"),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled", "refunded"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);

    const totalRevenue = Number(
      (revenueResult[0]?.totalRevenue || 0).toFixed(2),
    );

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          activeUsers,
          adminUsers,
          totalOrders,
          pendingOrders,
          totalRevenue,
          pendingTestimonials,
          approvedTestimonials,
          openTickets,
          activeProducts,
          lowStockProducts,
        },
        recentUsers,
        recentOrders,
        recentTickets,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to load admin overview",
      message: error.message,
    });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || "").trim();
    const isActive = parseBooleanQuery(req.query.isActive);

    const filters = {};

    if (USER_ROLES.includes(role)) {
      filters.role = role;
    }

    if (isActive !== null) {
      filters.isActive = isActive;
    }

    if (search) {
      const regex = toRegex(search);
      filters.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [users, totalCount] = await Promise.all([
      User.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "name email role isActive phone lastLoginAt createdAt updatedAt",
        ),
      User.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      count: users.length,
      pagination: formatPagination(page, limit, totalCount),
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      message: error.message,
    });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive, name, phone } = req.body;

    const updates = {};

    if (typeof role === "string" && USER_ROLES.includes(role)) {
      updates.role = role;
    }

    if (typeof isActive === "boolean") {
      updates.isActive = isActive;
    }

    if (typeof name === "string") {
      updates.name = name.trim();
    }

    if (typeof phone === "string") {
      updates.phone = phone.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid updates provided",
      });
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("name email role isActive phone lastLoginAt createdAt updatedAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await createAuditLog({
      req,
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "admin.user_updated",
      entityType: "user",
      entityId: user._id,
      metadata: {
        updates,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update user",
      message: error.message,
    });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();
    const paymentStatus = String(req.query.paymentStatus || "").trim();
    const from = String(req.query.from || "").trim();
    const to = String(req.query.to || "").trim();

    const filters = {};

    if (ORDER_STATUSES.includes(status)) {
      filters.status = status;
    }

    if (PAYMENT_STATUSES.includes(paymentStatus)) {
      filters.paymentStatus = paymentStatus;
    }

    if (from || to) {
      filters.placedAt = {};
      if (from) {
        filters.placedAt.$gte = new Date(from);
      }
      if (to) {
        filters.placedAt.$lte = new Date(to);
      }
    }

    if (search) {
      const regex = toRegex(search);
      filters.$or = [
        { orderNumber: regex },
        { "customer.name": regex },
        { "customer.email": regex },
        { "customer.phone": regex },
        { "customer.address.line1": regex },
        { "customer.address.city": regex },
        { "customer.address.state": regex },
      ];
    }

    const [orders, totalCount] = await Promise.all([
      Order.find(filters)
        .sort({ placedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email phone address"),
      Order.countDocuments(filters),
    ]);

    const enrichedOrders = orders.map((order) => {
      const serializedOrder = order.toObject();
      const userSnapshot = serializedOrder.userId || {};
      const customerSnapshot = serializedOrder.customer || {};
      const customerAddress = normalizeAddressSnapshot(
        customerSnapshot.address,
      );
      const userAddress = normalizeAddressSnapshot(userSnapshot.address);

      return {
        ...serializedOrder,
        customer: {
          ...customerSnapshot,
          name: String(customerSnapshot.name || userSnapshot.name || "").trim(),
          email: String(customerSnapshot.email || userSnapshot.email || "")
            .trim()
            .toLowerCase(),
          phone: String(
            customerSnapshot.phone || userSnapshot.phone || "",
          ).trim(),
          address: {
            line1: customerAddress.line1 || userAddress.line1,
            line2: customerAddress.line2 || userAddress.line2,
            city: customerAddress.city || userAddress.city,
            state: customerAddress.state || userAddress.state,
            postalCode: customerAddress.postalCode || userAddress.postalCode,
            country: customerAddress.country || userAddress.country || "India",
          },
        },
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedOrders.length,
      pagination: formatPagination(page, limit, totalCount),
      data: enrichedOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
      message: error.message,
    });
  }
};

export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      paymentStatus,
      trackingNumber,
      note,
      estimatedDeliveryDate,
    } = req.body;
    const hasEstimatedDeliveryInput = Object.prototype.hasOwnProperty.call(
      req.body || {},
      "estimatedDeliveryDate",
    );
    const statusNote = typeof note === "string" ? note.trim() : "";

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    let hasUpdates = false;

    if (
      typeof status === "string" &&
      ORDER_STATUSES.includes(status) &&
      status !== order.status
    ) {
      order.status = status;
      order.statusHistory.push({
        status,
        note: statusNote,
        updatedBy: toMongoObjectIdOrNull(req.userId),
        at: new Date(),
      });
      hasUpdates = true;
    }

    if (
      typeof paymentStatus === "string" &&
      PAYMENT_STATUSES.includes(paymentStatus) &&
      paymentStatus !== order.paymentStatus
    ) {
      order.paymentStatus = paymentStatus;
      hasUpdates = true;
    }

    if (typeof trackingNumber === "string") {
      const nextTrackingNumber = trackingNumber.trim();
      if (nextTrackingNumber !== order.trackingNumber) {
        order.trackingNumber = nextTrackingNumber;
        hasUpdates = true;
      }
    }

    if (typeof note === "string") {
      const nextNote = note.trim();
      if (nextNote !== order.notes) {
        order.notes = nextNote;
        hasUpdates = true;
      }
    }

    if (hasEstimatedDeliveryInput) {
      if (
        estimatedDeliveryDate === null ||
        String(estimatedDeliveryDate || "").trim() === ""
      ) {
        if (order.estimatedDeliveryDate !== null) {
          order.estimatedDeliveryDate = null;
          hasUpdates = true;
        }
      } else {
        const parsedEstimatedDate = new Date(estimatedDeliveryDate);
        if (Number.isNaN(parsedEstimatedDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Invalid estimated delivery date",
          });
        }

        const currentTime = order.estimatedDeliveryDate
          ? new Date(order.estimatedDeliveryDate).getTime()
          : null;
        const nextTime = parsedEstimatedDate.getTime();

        if (currentTime !== nextTime) {
          order.estimatedDeliveryDate = parsedEstimatedDate;
          hasUpdates = true;
        }
      }
    }

    if (!hasUpdates) {
      return res.status(400).json({
        success: false,
        error: "No valid updates provided",
      });
    }

    await order.save();

    await createAuditLog({
      req,
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "admin.order_updated",
      entityType: "order",
      entityId: order._id,
      metadata: {
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        note: order.notes,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update order",
      message: error.message,
    });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const isActive = parseBooleanQuery(req.query.isActive);

    const filters = {};

    if (category) {
      filters.category = category;
    }

    if (isActive !== null) {
      filters.isActive = isActive;
    }

    if (search) {
      const regex = toRegex(search);
      filters.$or = [{ name: regex }, { slug: regex }, { sku: regex }];
    }

    const [products, totalCount] = await Promise.all([
      Product.find(filters).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      pagination: formatPagination(page, limit, totalCount),
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch products",
      message: error.message,
    });
  }
};

export const createAdminProduct = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const price = Number(req.body?.price);

    if (!name || Number.isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        error: "Valid name and price are required",
      });
    }

    const images = Array.isArray(req.body?.images)
      ? req.body.images.filter(Boolean)
      : req.body?.image
        ? [String(req.body.image).trim()]
        : [];

    const packSizes = parsePackSizes(req.body?.packSizes, price);
    const estimatedDispatchDays = Math.max(
      0,
      Number.parseInt(req.body?.estimatedDispatchDays, 10) || 10,
    );

    const product = await Product.create({
      name,
      description: String(req.body?.description || "").trim(),
      category:
        String(req.body?.category || "supplement").trim() || "supplement",
      price,
      compareAtPrice: Math.max(0, Number(req.body?.compareAtPrice) || 0),
      inventory: Math.max(0, Number.parseInt(req.body?.inventory, 10) || 0),
      sku: String(req.body?.sku || "").trim() || undefined,
      tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
      images,
      packSizes,
      isPreorderEnabled: req.body?.isPreorderEnabled !== false,
      estimatedDispatchDays,
      isActive: req.body?.isActive !== false,
      updatedBy: req.userId,
    });

    await createAuditLog({
      req,
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "admin.product_created",
      entityType: "product",
      entityId: product._id,
      metadata: {
        name: product.name,
        price: product.price,
        isPreorderEnabled: product.isPreorderEnabled,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to create product",
      message: error.message,
    });
  }
};

export const updateAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    if (typeof req.body?.name === "string") {
      product.name = req.body.name.trim();
    }

    if (typeof req.body?.description === "string") {
      product.description = req.body.description.trim();
    }

    if (typeof req.body?.category === "string") {
      product.category = req.body.category.trim();
    }

    if (req.body?.price !== undefined) {
      const price = Number(req.body.price);
      if (!Number.isNaN(price) && price >= 0) {
        product.price = price;
      }
    }

    if (req.body?.compareAtPrice !== undefined) {
      const compareAtPrice = Number(req.body.compareAtPrice);
      if (!Number.isNaN(compareAtPrice) && compareAtPrice >= 0) {
        product.compareAtPrice = compareAtPrice;
      }
    }

    if (req.body?.inventory !== undefined) {
      const inventory = Number.parseInt(req.body.inventory, 10);
      if (!Number.isNaN(inventory) && inventory >= 0) {
        product.inventory = inventory;
      }
    }

    if (typeof req.body?.sku === "string") {
      product.sku = req.body.sku.trim() || undefined;
    }

    if (Array.isArray(req.body?.tags)) {
      product.tags = req.body.tags;
    }

    if (Array.isArray(req.body?.packSizes)) {
      product.packSizes = parsePackSizes(req.body.packSizes, product.price);
    }

    if (Array.isArray(req.body?.images)) {
      product.images = req.body.images.filter(Boolean);
    } else if (typeof req.body?.image === "string") {
      product.images = [req.body.image.trim()];
    }

    if (typeof req.body?.isPreorderEnabled === "boolean") {
      product.isPreorderEnabled = req.body.isPreorderEnabled;
    }

    if (req.body?.estimatedDispatchDays !== undefined) {
      const estimatedDispatchDays = Number.parseInt(
        req.body.estimatedDispatchDays,
        10,
      );
      if (!Number.isNaN(estimatedDispatchDays) && estimatedDispatchDays >= 0) {
        product.estimatedDispatchDays = estimatedDispatchDays;
      }
    }

    if (typeof req.body?.isActive === "boolean") {
      product.isActive = req.body.isActive;
    }

    product.updatedBy = req.userId;

    await product.save();

    await createAuditLog({
      req,
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "admin.product_updated",
      entityType: "product",
      entityId: product._id,
      metadata: {
        price: product.price,
        inventory: product.inventory,
        isActive: product.isActive,
        isPreorderEnabled: product.isPreorderEnabled,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update product",
      message: error.message,
    });
  }
};

export const archiveAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        isActive: false,
        updatedBy: req.userId,
      },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    await createAuditLog({
      req,
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "admin.product_archived",
      entityType: "product",
      entityId: product._id,
      metadata: {
        name: product.name,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product archived successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to archive product",
      message: error.message,
    });
  }
};

export const getAdminSupportTickets = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();
    const priority = String(req.query.priority || "").trim();

    const filters = {};

    if (TICKET_STATUSES.includes(status)) {
      filters.status = status;
    }

    if (TICKET_PRIORITIES.includes(priority)) {
      filters.priority = priority;
    }

    if (search) {
      const regex = toRegex(search);
      filters.$or = [
        { ticketNumber: regex },
        { name: regex },
        { email: regex },
        { subject: regex },
      ];
    }

    const [tickets, totalCount] = await Promise.all([
      SupportTicket.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("assignedTo", "name email"),
      SupportTicket.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      count: tickets.length,
      pagination: formatPagination(page, limit, totalCount),
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch support tickets",
      message: error.message,
    });
  }
};

export const updateAdminSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, adminNote } = req.body;

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Support ticket not found",
      });
    }

    let hasUpdates = false;

    if (typeof status === "string" && TICKET_STATUSES.includes(status)) {
      ticket.status = status;
      hasUpdates = true;
    }

    if (typeof priority === "string" && TICKET_PRIORITIES.includes(priority)) {
      ticket.priority = priority;
      hasUpdates = true;
    }

    if (typeof assignedTo === "string") {
      ticket.assignedTo = assignedTo || null;
      hasUpdates = true;
    }

    if (typeof adminNote === "string" && adminNote.trim()) {
      ticket.adminNotes.push({
        note: adminNote.trim(),
        author: req.userId,
        createdAt: new Date(),
      });
      ticket.lastResponseAt = new Date();
      hasUpdates = true;
    }

    if (!hasUpdates) {
      return res.status(400).json({
        success: false,
        error: "No valid updates provided",
      });
    }

    await ticket.save();
    await ticket.populate("assignedTo", "name email");

    await createAuditLog({
      req,
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "admin.support_ticket_updated",
      entityType: "support_ticket",
      entityId: ticket._id,
      metadata: {
        status: ticket.status,
        priority: ticket.priority,
        hasAdminNote: Boolean(adminNote),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Support ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update support ticket",
      message: error.message,
    });
  }
};

export const getAdminTestimonials = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();

    const filters = {};
    if (TESTIMONIAL_STATUSES.includes(status)) {
      filters.status = status;
    }

    if (search) {
      const regex = toRegex(search);
      filters.$or = [{ name: regex }, { quote: regex }, { role: regex }];
    }

    const [testimonials, totalCount] = await Promise.all([
      Testimonial.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("moderatedBy", "name email"),
      Testimonial.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      pagination: formatPagination(page, limit, totalCount),
      data: testimonials,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch testimonials",
      message: error.message,
    });
  }
};

export const getAdminAuditLogs = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = String(req.query.search || "").trim();
    const action = String(req.query.action || "").trim();
    const entityType = String(req.query.entityType || "").trim();
    const status = String(req.query.status || "").trim();
    const from = String(req.query.from || "").trim();
    const to = String(req.query.to || "").trim();

    const filters = {};

    if (action) {
      filters.action = action;
    }

    if (entityType) {
      filters.entityType = entityType;
    }

    if (["success", "failure"].includes(status)) {
      filters.status = status;
    }

    if (from || to) {
      filters.createdAt = {};
      if (from) {
        filters.createdAt.$gte = new Date(from);
      }
      if (to) {
        filters.createdAt.$lte = new Date(to);
      }
    }

    if (search) {
      const regex = toRegex(search);
      filters.$or = [
        { actorEmail: regex },
        { action: regex },
        { entityType: regex },
        { entityId: regex },
      ];
    }

    const [logs, totalCount] = await Promise.all([
      AuditLog.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("actorId", "name email role"),
      AuditLog.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      count: logs.length,
      pagination: formatPagination(page, limit, totalCount),
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch audit logs",
      message: error.message,
    });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const startDate = parseDateRange(req.query.range);

    const [
      newUsers,
      orderCount,
      ticketCount,
      testimonialCount,
      pendingTestimonials,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Order.countDocuments({ placedAt: { $gte: startDate } }),
      SupportTicket.countDocuments({ createdAt: { $gte: startDate } }),
      Testimonial.countDocuments({ createdAt: { $gte: startDate } }),
      Testimonial.countDocuments({ status: "pending" }),
    ]);

    const [revenueResult, topProducts, ordersByStatus] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            placedAt: { $gte: startDate },
            status: { $nin: ["cancelled", "refunded"] },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            placedAt: { $gte: startDate },
            status: { $nin: ["cancelled", "refunded"] },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: {
              productId: "$items.productId",
              productName: "$items.productName",
            },
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        {
          $match: {
            placedAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const revenue = Number((revenueResult[0]?.revenue || 0).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        rangeStart: startDate,
        metrics: {
          newUsers,
          orderCount,
          revenue,
          ticketCount,
          testimonialCount,
          pendingTestimonials,
        },
        topProducts: topProducts.map((item) => ({
          productId: item._id.productId,
          productName: item._id.productName,
          totalQuantity: item.totalQuantity,
          totalRevenue: Number(item.totalRevenue.toFixed(2)),
        })),
        ordersByStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
      message: error.message,
    });
  }
};
