import { Router } from "express";
import { emailVerificationToken, registerUser, verifyUserAccount } from "../controllers/user.controllers.js";

const router = Router();

router.post('/register', registerUser)

router.get('/generate/verifytoken/:email', emailVerificationToken)

router.get('/verifyUser/:token',verifyUserAccount)

export default router