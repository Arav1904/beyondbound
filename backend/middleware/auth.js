import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-me";

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
