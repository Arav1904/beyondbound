import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/beyond-bound";
const TARGET_EMAIL = String(
  process.env.ADMIN_BOOTSTRAP_EMAIL || "beyondbound889@gmail.com",
)
  .toLowerCase()
  .trim();

const toDisplayName = (email) => {
  const localPart = String(email || "").split("@")[0] || "admin";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ") || "Beyond Bound Admin";
};

async function run() {
  if (!TARGET_EMAIL) {
    throw new Error("ADMIN_BOOTSTRAP_EMAIL is required");
  }

  await mongoose.connect(MONGODB_URI);

  const existingUser = await User.findOne({ email: TARGET_EMAIL });

  if (existingUser) {
    existingUser.role = "admin";
    existingUser.isActive = true;
    await existingUser.save();

    console.log(
      `[bootstrap-admin] Updated existing user ${TARGET_EMAIL} with admin role.`,
    );
  } else {
    const user = await User.create({
      email: TARGET_EMAIL,
      name: toDisplayName(TARGET_EMAIL),
      provider: "bootstrap",
      role: "admin",
      isActive: true,
      lastLoginAt: new Date(),
      lastSeenAt: new Date(),
    });

    console.log(
      `[bootstrap-admin] Created admin user ${user.email}. Account will link to Google on first sign-in with same email.`,
    );
  }

  console.log(
    `[bootstrap-admin] Ensure ADMIN_ALLOWLIST includes ${TARGET_EMAIL} for dashboard access.`,
  );
}

run()
  .catch((error) => {
    console.error("[bootstrap-admin] Failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
