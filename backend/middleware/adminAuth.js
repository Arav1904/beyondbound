import { authenticate } from "./auth.js";

const ADMIN_ALLOWLIST = new Set(
  (process.env.ADMIN_ALLOWLIST || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

const verifyAdminAccess = (req, res, next) => {
  const userRole = req.user?.role || req.authRole;
  const email = String(req.user?.email || "").toLowerCase();

  if (ADMIN_ALLOWLIST.size === 0) {
    return res.status(503).json({
      success: false,
      error: "Admin allowlist is not configured",
    });
  }

  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin role is required",
    });
  }

  if (!ADMIN_ALLOWLIST.has(email)) {
    return res.status(403).json({
      success: false,
      error: "This account is not allowlisted for admin access",
    });
  }

  return next();
};

export const requireAdmin = [authenticate, verifyAdminAccess];
