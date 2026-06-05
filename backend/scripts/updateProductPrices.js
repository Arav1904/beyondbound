import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const TARGET_SLUG = "glycomics";
const NEW_PRICE = 1499;
const NEW_PACK_SIZES = [
  { value: "20", label: "20 Capsules", price: 499 },
  { value: "60", label: "60 Capsules", price: 1499 },
];

const run = async () => {
  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    throw new Error("MONGO_URI or MONGODB_URI is required");
  }

  await mongoose.connect(
    process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/beyond-bound",
  );

  const product = await Product.findOne({ slug: TARGET_SLUG });
  if (!product) {
    throw new Error(`Product not found for slug: ${TARGET_SLUG}`);
  }

  product.price = NEW_PRICE;
  product.compareAtPrice = NEW_PRICE;
  product.packSizes = NEW_PACK_SIZES;
  await product.save();

  console.log(
    `Updated ${product.name} (${product._id}) to price ${NEW_PRICE} with pack sizes: ${NEW_PACK_SIZES.map(
      (pack) => `${pack.value}=${pack.price}`,
    ).join(", ")}`,
  );

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Price update failed:", error.message || error);
  mongoose.disconnect();
  process.exitCode = 1;
});
