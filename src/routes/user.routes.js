import { Router } from "express";
import { changePassword, emailVerificationToken, forgotPassword, getProfile, loginUser, logoutUser, refreshAccessToken, registerUser, resetPassword, updateUserAvatarImage, updateUserDetails, verifyUserAccount } from "../controllers/user.controllers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import multerfunc from "../middlewares/multer.middleware.js";
import { imageExtn, imageSize } from "../constants.js";

//--------------------

const router = Router();

const imagemulter = multerfunc(imageSize, imageExtn);

//----------------------------------

router.post('/register', registerUser);

router.get('/generate/verifytoken', isLoggedIn(false), emailVerificationToken); //isLoggedin(false) allowing unverifed account users to access this route

router.post('/verifyUser',isLoggedIn(false), verifyUserAccount);

router.post('/login',loginUser);

router.get('/me',isLoggedIn(false),getProfile);

router.get('/logout',isLoggedIn(false),logoutUser);

router.get('/refreshToken',refreshAccessToken);

router.post('/changePassword',isLoggedIn(),changePassword);

router.post('/forgotPassword',forgotPassword);

router.post('/resetPassword/:token',resetPassword);

router.post('/updateUserAvatarImage',isLoggedIn(),imagemulter.single("avatar"),updateUserAvatarImage);

router.post('/updateUserDetails',isLoggedIn(),updateUserDetails);

export default router;