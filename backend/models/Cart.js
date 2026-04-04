import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, "Product id is required"],
      trim: true,
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    size: {
      type: String,
      default: "",
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

cartSchema.pre("save", function syncCartTotals(next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = Number(
    this.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );
  next();
});

export default mongoose.model("Cart", cartSchema);
