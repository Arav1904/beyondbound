import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import testimonialRoutes from "./routes/testimonials.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import adminRoutes from "./routes/admin.js";
import supportRoutes from "./routes/support.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mongoConnected = false;

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (IS_PRODUCTION && allowedOrigins.length === 0) {
  console.warn("[config] CORS_ORIGIN is not set; allowing all origins.");
}

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.length === 0) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (!IS_PRODUCTION && /^https?:\/\/localhost(:\d+)?$/i.test(origin)) {
    return true;
  }

  return false;
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Math.max(50, Number.parseInt(process.env.RATE_LIMIT_MAX || "250", 10)),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again later",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Math.max(
    10,
    Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX || "40", 10),
  ),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many auth attempts, please try again later",
  },
});

// Middleware
app.set("trust proxy", 1);
app.use(helmet());
const corsMiddleware = cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Blocked by CORS policy"));
  },
  credentials: true,
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api/orders/payu/callback")) {
    return next();
  }

  return corsMiddleware(req, res, next);
});
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/beyond-bound",
  )
  .then(() => {
    mongoConnected = true;
    console.log("MongoDB connected");
  })
  .catch((err) => {
    mongoConnected = false;
    console.log("MongoDB connection error:", err);
  });

mongoose.connection.on("connected", () => {
  mongoConnected = true;
});

mongoose.connection.on("disconnected", () => {
  mongoConnected = false;
});

const requireMongoConnection = (_req, res, next) => {
  if (mongoConnected || mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    success: false,
    error:
      "Database features are temporarily unavailable. Auth can continue, but this endpoint requires MongoDB.",
  });
};

// Routes
app.use("/api/testimonials", requireMongoConnection, testimonialRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", requireMongoConnection, cartRoutes);
app.use("/api/orders", requireMongoConnection, orderRoutes);
app.use("/api/support", requireMongoConnection, supportRoutes);
app.use("/api/admin", requireMongoConnection, adminRoutes);
app.use("/api/products", requireMongoConnection, productRoutes);

// Root endpoint for browser visits
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Beyond Bound backend is running",
    endpoints: {
      health: "/api/health",
      testimonialsGet: "/api/testimonials",
      testimonialsPost: "/api/testimonials",
      authGoogle: "/api/auth/google",
      authMe: "/api/auth/me",
      cart: "/api/cart",
      orders: "/api/orders",
      support: "/api/support",
      admin: "/api/admin",
      products: "/api/products",
    },
  });
});

// API root endpoint for quick sanity checks.
app.get("/api", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Beyond Bound API is running",
    mongoConnected: mongoConnected || mongoose.connection.readyState === 1,
    docs: "/api/health",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);

  if (err.message === "Blocked by CORS policy") {
    return res.status(403).json({
      success: false,
      error: "Request origin is not allowed",
    });
  }

  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
