import mongoose from "mongoose";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const packSizeSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Pack size price must be positive"],
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    sku: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "supplement",
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    compareAtPrice: {
      type: Number,
      default: 0,
      min: [0, "Compare at price must be positive"],
    },
    inventory: {
      type: Number,
      default: 0,
      min: [0, "Inventory cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    packSizes: {
      type: [packSizeSchema],
      default: () => [
        { value: "60", label: "60 Capsules", price: 1925 },
        { value: "20", label: "20 Capsules", price: 600 },
      ],
    },
    estimatedDispatchDays: {
      type: Number,
      default: 10,
      min: [0, "Estimated dispatch days cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

productSchema.pre("validate", function ensureSlug(next) {
  if (!this.slug) {
    this.slug = slugify(this.name);
  }

  next();
});

export default mongoose.model("Product", productSchema);
