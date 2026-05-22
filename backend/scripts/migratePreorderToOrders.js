import "dotenv/config";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const statusMap = {
  preorder_requested: "placed",
  preorder_confirmed: "confirmed",
};

const toMongoUri = () =>
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/beyond-bound";

const normalizeNote = (note) => {
  if (!note) {
    return note;
  }

  return String(note)
    .replace(/pre-?order/gi, "order")
    .replace(/Order request created/gi, "Order placed");
};

const migrateOrders = async () => {
  const orders = await Order.find({
    $or: [
      { status: { $in: Object.keys(statusMap) } },
      { "statusHistory.status": { $in: Object.keys(statusMap) } },
    ],
  });

  let updatedCount = 0;

  for (const order of orders) {
    let changed = false;

    if (statusMap[order.status]) {
      order.status = statusMap[order.status];
      changed = true;
    }

    if (Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
      order.statusHistory = order.statusHistory.map((entry) => {
        const nextStatus = statusMap[entry.status] || entry.status;
        const nextNote = normalizeNote(entry.note);

        if (nextStatus !== entry.status || nextNote !== entry.note) {
          changed = true;
          return {
            ...entry.toObject(),
            status: nextStatus,
            note: nextNote,
          };
        }

        return entry;
      });
    }

    if (changed) {
      updatedCount += 1;
      await order.save();
    }
  }

  return { scanned: orders.length, updated: updatedCount };
};

const migrateProducts = async () => {
  const result = await Product.updateMany(
    { isPreorderEnabled: { $exists: true } },
    { $unset: { isPreorderEnabled: "" } },
  );

  return {
    matched: result.matchedCount ?? result.n ?? 0,
    modified: result.modifiedCount ?? result.nModified ?? 0,
  };
};

const run = async () => {
  const uri = toMongoUri();
  console.log(`[migrate] Connecting to ${uri}`);

  await mongoose.connect(uri);

  try {
    const orderResult = await migrateOrders();
    const productResult = await migrateProducts();

    console.log(
      `[migrate] Orders scanned: ${orderResult.scanned}, updated: ${orderResult.updated}`,
    );
    console.log(
      `[migrate] Products matched: ${productResult.matched}, modified: ${productResult.modified}`,
    );
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error("[migrate] Failed to complete migration", error);
  process.exit(1);
});
