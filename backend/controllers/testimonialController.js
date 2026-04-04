import Testimonial from "../models/Testimonial.js";
import { validationResult } from "express-validator";
import { createAuditLog } from "../utils/auditLog.js";

const parsePagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const toStatusFromVerified = (verified, fallback = "pending") => {
  if (typeof verified !== "boolean") {
    return fallback;
  }

  return verified ? "approved" : "rejected";
};

// GET all testimonials
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      verified: true,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch testimonials",
      message: error.message,
    });
  }
};

// POST new testimonial
export const submitTestimonial = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, role, quote, rating } = req.body;

    // Create new testimonial
    const testimonial = new Testimonial({
      name,
      role: role || "Verified Customer",
      quote,
      rating: rating || 5,
      verified: false, // Admin must verify before displaying
      status: "pending",
    });

    await testimonial.save();

    await createAuditLog({
      req,
      actorEmail: String(req.body?.email || ""),
      action: "testimonial.submitted",
      entityType: "testimonial",
      entityId: testimonial._id,
      metadata: {
        name,
        rating: testimonial.rating,
      },
    });

    res.status(201).json({
      success: true,
      message:
        "Testimonial submitted successfully. Our team will review it shortly.",
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to submit testimonial",
      message: error.message,
    });
  }
};

// GET all testimonials (admin only - including unverified)
export const getAllTestimonialsAdmin = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim().toLowerCase();

    const filters = {};
    if (["pending", "approved", "rejected"].includes(status)) {
      filters.status = status;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filters.$or = [{ name: regex }, { quote: regex }, { role: regex }];
    }

    const [testimonials, totalCount] = await Promise.all([
      Testimonial.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("moderatedBy", "name email"),
      Testimonial.countDocuments(filters),
    ]);

    res.status(200).json({
      success: true,
      count: testimonials.length,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      },
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch testimonials",
      message: error.message,
    });
  }
};

// UPDATE testimonial (admin only - verify/unverify)
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, name, quote, rating, role, status, moderationNote } = req.body;

    const updatePayload = {};

    if (typeof name === "string") {
      updatePayload.name = name;
    }

    if (typeof quote === "string") {
      updatePayload.quote = quote;
    }

    if (typeof role === "string") {
      updatePayload.role = role;
    }

    if (rating !== undefined) {
      updatePayload.rating = rating;
    }

    if (typeof status === "string" && ["pending", "approved", "rejected"].includes(status)) {
      updatePayload.status = status;
      updatePayload.verified = status === "approved";
    } else if (typeof verified === "boolean") {
      updatePayload.verified = verified;
      updatePayload.status = toStatusFromVerified(verified, "pending");
    }

    if (typeof moderationNote === "string") {
      updatePayload.moderationNote = moderationNote.trim();
    }

    updatePayload.moderatedBy = req.userId;
    updatePayload.moderatedAt = new Date();

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true },
    ).populate("moderatedBy", "name email");

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: "Testimonial not found",
      });
    }

    await createAuditLog({
      req,
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "testimonial.moderated",
      entityType: "testimonial",
      entityId: testimonial._id,
      metadata: {
        status: testimonial.status,
        verified: testimonial.verified,
      },
    });

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update testimonial",
      message: error.message,
    });
  }
};

// DELETE testimonial (admin only)
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: "Testimonial not found",
      });
    }

    await createAuditLog({
      req,
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "testimonial.deleted",
      entityType: "testimonial",
      entityId: testimonial._id,
      metadata: {
        name: testimonial.name,
      },
    });

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete testimonial",
      message: error.message,
    });
  }
};
