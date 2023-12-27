import { Router } from "express";
import { emailVerificationToken, registerUser, verifyUserAccount } from "../controllers/user.controllers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/register', registerUser);

router.get('/generate/verifytoken', isLoggedIn(false), emailVerificationToken); //allowing unverifed account users to access this route

router.post('/verifyUser',isLoggedIn(false), verifyUserAccount);//allowing unverifed account users to access this route

export default router;