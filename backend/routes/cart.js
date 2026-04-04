import express from "express";
import {
  addItemToCart,
  clearCart,
  getCart,
  mergeGuestCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.get("/", getCart);
router.post("/items", addItemToCart);
router.patch("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeCartItem);
router.delete("/", clearCart);
router.post("/merge", mergeGuestCart);

export default router;
