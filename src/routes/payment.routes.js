import { Router } from "express";
import { allSales, createOrder, mysales, verifyPayment } from "../controllers/payment.controller.js";
import { authorizedroles, isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.all("/*",isLoggedIn())

router.post("/createOrder", createOrder);

router.post("/verify", verifyPayment);

router.get("/mySales",authorizedroles("INSTRUCTOR"), mysales );

router.get("/allSales",authorizedroles("ADMIN"), allSales);

export default router;