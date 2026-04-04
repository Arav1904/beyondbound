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

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    picture: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: addressSchema,
      default: () => ({ country: "India" }),
    },
    provider: {
      type: String,
      default: "google",
      trim: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
