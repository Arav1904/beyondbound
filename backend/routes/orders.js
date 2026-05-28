import express from "express";
import {
  getMyOrderById,
  getMyOrders,
  handlePayuCallback,
  initiatePayuPayment,
  placeOrder,
} from "../controllers/orderController.js";
import { authenticate, authenticateOptional } from "../middleware/auth.js";

const router = express.Router();

router.post("/payu/callback", handlePayuCallback);
router.post("/payu/initiate", authenticateOptional, initiatePayuPayment);

router.use(authenticate);
router.get("/my", getMyOrders);
router.get("/my/:orderId", getMyOrderById);
router.post("/", placeOrder);
router.post("/place", placeOrder);

export default router;
