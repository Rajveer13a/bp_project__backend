import { Router } from "express";
import { emailVerificationToken, getProfile, loginUser, logoutUser, registerUser, verifyUserAccount } from "../controllers/user.controllers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/register', registerUser);

router.get('/generate/verifytoken', isLoggedIn(false), emailVerificationToken); //isLoggedin(false) allowing unverifed account users to access this route

router.post('/verifyUser',isLoggedIn(false), verifyUserAccount);

router.post('/login',loginUser);

router.get('/me',isLoggedIn(false),getProfile);

router.get('/logout',isLoggedIn(false),logoutUser);



export default router;