import express from "express";
import {
  createOrder,
  getOrders,
  verifyDelivery,
  regenerateOTP,
} from "../controllers/orderController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createOrder);
router.get("/", auth, getOrders);
router.post("/verify-delivery", auth, verifyDelivery);
router.post("/:id/regenerate-otp", auth, regenerateOTP);

export default router;
