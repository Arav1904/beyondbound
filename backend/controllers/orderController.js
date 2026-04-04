import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

const parsePagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return {
    page,
    limit,
    skip: (page - 1) * limit,
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
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export const placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });

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
      userId: req.userId,
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
      paymentMethod: String(req.body?.paymentMethod || "cod").trim() || "cod",
      paymentStatus: "pending",
      status: "placed",
      notes: String(req.body?.notes || "").trim(),
      placedAt: new Date(),
    });

    cart.items = [];
    await cart.save();

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

    const filter = { userId: req.userId };
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
