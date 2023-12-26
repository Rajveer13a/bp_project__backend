import { Router } from "express";
import { emailVerificationToken, registerUser } from "../controllers/user.controllers.js";

const router = Router();

router.post('/register', registerUser)

router.get('/generate/verifytoken/:email', emailVerificationToken)

export default router