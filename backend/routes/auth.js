import express from "express";
import {
  getCurrentSession,
  googleSignIn,
  updateProfile,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/google", googleSignIn);
router.get("/me", authenticate, getCurrentSession);
router.put("/profile", authenticate, updateProfile);

export default router;
