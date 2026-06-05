import express from "express";
import {
  getMyOrderById,
  getMyOrders,
  initiatePayuPayment,
  placeOrder,
} from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// NOTE: /payu/callback is registered in server.js directly (before global CORS middleware)
// so it is NOT registered here to avoid double-handling and CORS rejection.
router.post("/payu/initiate", authenticate, initiatePayuPayment);

router.use(authenticate);
router.get("/my", getMyOrders);
router.get("/my/:orderId", getMyOrderById);
router.post("/", placeOrder);
router.post("/place", placeOrder);

export default router;

