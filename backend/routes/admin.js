import express from "express";
import {
  archiveAdminProduct,
  createAdminProduct,
  getAdminAnalytics,
  getAdminOrders,
  getAdminOverview,
  getAdminProducts,
  getAdminSupportTickets,
  getAdminTestimonials,
  getAdminUsers,
  updateAdminOrderStatus,
  updateAdminProduct,
  updateAdminSupportTicket,
  updateAdminUser,
} from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(requireAdmin);

router.get("/overview", getAdminOverview);
router.get("/analytics", getAdminAnalytics);

router.get("/users", getAdminUsers);
router.patch("/users/:id", updateAdminUser);

router.get("/orders", getAdminOrders);
router.patch("/orders/:id/status", updateAdminOrderStatus);

router.get("/products", getAdminProducts);
router.post("/products", createAdminProduct);
router.put("/products/:id", updateAdminProduct);
router.delete("/products/:id", archiveAdminProduct);

router.get("/support", getAdminSupportTickets);
router.patch("/support/:id", updateAdminSupportTicket);

router.get("/testimonials", getAdminTestimonials);

export default router;
