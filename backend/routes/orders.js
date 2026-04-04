import express from "express";
import { getMyOrders, placeOrder } from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.get("/my", getMyOrders);
router.post("/place", placeOrder);

export default router;
