import express from "express";
import { body } from "express-validator";
import {
  getTestimonials,
  submitTestimonial,
  getAllTestimonialsAdmin,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Validation middleware
const validateTestimonial = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("quote")
    .trim()
    .notEmpty()
    .withMessage("Testimonial quote is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Quote must be between 10 and 500 characters"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

// Public routes
router.get("/", getTestimonials);
router.post("/", validateTestimonial, submitTestimonial);

// Admin routes
router.get("/admin/all", requireAdmin, getAllTestimonialsAdmin);
router.put("/admin/:id", requireAdmin, updateTestimonial);
router.delete("/admin/:id", requireAdmin, deleteTestimonial);

export default router;
