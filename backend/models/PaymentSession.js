import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "India" },
  },
  { _id: false },
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    size: { type: String, default: "", trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "", trim: true },
  },
  { _id: true },
);

const paymentSessionSchema = new mongoose.Schema(
  {
    txnId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    customer: {
      name: { type: String, default: "", trim: true },
      email: { type: String, default: "", lowercase: true, trim: true },
      phone: { type: String, default: "", trim: true },
      address: {
        type: addressSchema,
        default: () => ({ country: "India" }),
      },
    },
    items: { type: [orderItemSchema], default: [] },
    currency: { type: String, default: "INR", trim: true, uppercase: true },
    subtotal: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: "", trim: true },
    returnUrl: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export default mongoose.model("PaymentSession", paymentSessionSchema);
