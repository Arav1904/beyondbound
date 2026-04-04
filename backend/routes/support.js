import express from "express";
import { submitSupportTicket } from "../controllers/supportController.js";

const router = express.Router();

router.post("/", submitSupportTicket);

export default router;
