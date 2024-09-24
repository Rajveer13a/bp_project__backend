import { Router } from "express";
import { addBankAccount, getBankAccount } from "../controllers/revenueShare.controller.js";
import { authorizedroles, isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.all("/*", isLoggedIn(), authorizedroles("INSTRUCTOR"));

router.post("/link-bank", addBankAccount);

router.get("/account", getBankAccount);

export default  router;