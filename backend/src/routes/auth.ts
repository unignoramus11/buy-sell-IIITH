import express from "express";
import { register, login } from "../controllers/authController";
import { verifyRecaptcha } from "../middleware/recaptcha";

const router = express.Router();

router.post("/register", verifyRecaptcha, register);
router.post("/login", verifyRecaptcha, login);

export default router;
