import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import testimonialRoutes from "./routes/testimonials.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/beyond-bound")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);

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
    },
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
