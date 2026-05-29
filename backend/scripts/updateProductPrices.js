import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const PRODUCT_ID = "69db7cd129eeea5bd6fde7df";
const NEW_PRICE = 1599;
const NEW_PACK_SIZES = [
  { value: "20", label: "20 Capsules", price: 1 },
  { value: "60", label: "60 Capsules", price: 1599 },
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

  const product = await Product.findById(PRODUCT_ID);
  if (!product) {
    throw new Error(`Product not found: ${PRODUCT_ID}`);
  }

  product.price = NEW_PRICE;
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
