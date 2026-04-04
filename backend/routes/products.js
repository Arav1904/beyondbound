import express from "express";
import {
  getPrimaryProduct,
  getPublicProductByIdentifier,
  getPublicProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getPublicProducts);
router.get("/featured/primary", getPrimaryProduct);
router.get("/:identifier", getPublicProductByIdentifier);

export default router;
