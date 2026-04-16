import express from "express";
import {
  getMyOrderById,
  getMyOrders,
  placeOrder,
  placePreorderFromForm,
} from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.get("/my", getMyOrders);
router.get("/my/:orderId", getMyOrderById);
router.post("/place", placeOrder);
router.post("/preorder", placeOrder);
router.post("/preorder-form", placePreorderFromForm);

export default router;
