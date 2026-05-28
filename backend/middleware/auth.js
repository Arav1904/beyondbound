import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-me";
const AUTH_STATELESS = process.env.AUTH_STATELESS !== "false";

const buildUserFromToken = (payload) => {
  const userId = String(payload.userId || payload.sub || payload.email || "");

  return {
    _id: userId,
    id: userId,
    googleId: String(payload.googleId || ""),
    email: String(payload.email || ""),
    name: String(payload.name || ""),
    picture: String(payload.picture || ""),
    phone: String(payload.phone || ""),
    address:
      payload.address && typeof payload.address === "object"
        ? payload.address
        : {
            line1: "",
            line2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
          },
    role: payload.role || "user",
    isActive: payload.isActive !== false,
  };
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);

    if (AUTH_STATELESS) {
      req.userId = String(payload.userId || payload.sub || payload.email || "");
      req.user = buildUserFromToken(payload);
      req.authToken = token;
      req.authRole = payload.role || req.user.role;

      return next();
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication failed: user not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        error: "Your account is currently suspended",
      });
    }

    req.userId = user._id;
    req.user = user;
    req.authToken = token;
    req.authRole = payload.role || user.role;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
      message: error.message,
    });
  }
};

export const authenticateOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);

    if (AUTH_STATELESS) {
      req.userId = String(payload.userId || payload.sub || payload.email || "");
      req.user = buildUserFromToken(payload);
      req.authToken = token;
      req.authRole = payload.role || req.user.role;

      return next();
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication failed: user not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        error: "Your account is currently suspended",
      });
    }

    req.userId = user._id;
    req.user = user;
    req.authToken = token;
    req.authRole = payload.role || user.role;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
      message: error.message,
    });
  }
};
