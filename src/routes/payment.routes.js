import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.all("/*",isLoggedIn())

router.get("/createOrder", createOrder);

router.post("/verify", verifyPayment);

export default router;