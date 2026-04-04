import AuditLog from "../models/AuditLog.js";

const extractClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "";
};

export const createAuditLog = async ({
  req,
  actorId = null,
  actorEmail = "",
  action,
  entityType = "",
  entityId = "",
  status = "success",
  metadata = {},
}) => {
  if (!action) {
    return;
  }

  try {
    await AuditLog.create({
      actorId,
      actorEmail: String(actorEmail || "").toLowerCase().trim(),
      action: String(action).trim(),
      entityType: String(entityType || "").trim(),
      entityId: String(entityId || "").trim(),
      status: status === "failure" ? "failure" : "success",
      metadata,
      ip: extractClientIp(req),
      userAgent: String(req.headers["user-agent"] || "").slice(0, 500),
    });
  } catch (error) {
    // Logging should not block user/admin actions.
    console.error("Audit log write failed:", error.message);
  }
};
