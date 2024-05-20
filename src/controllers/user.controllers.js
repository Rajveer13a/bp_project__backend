import apiResponse from "../utils/apiResponse.js";
import tryCatch from "../utils/tryCatch.js"
import apiError from "../utils/apiError.js"
import User from "../models/user.model.js";
import { sendForgotPasswordMail, sendVerifyMail } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { profileImgConfig, randomByteSize } from "../constants.js";
import jwt from "jsonwebtoken";
import { type } from "os";
import { log } from "console";
import {uploadCloudinary, cloudinary} from "../utils/cloudinary.js";

const cookieOptions = {
    httpOnly: false,
    secure: true,
    sameSite: 'None'
}

//___________________________________

const registerUser = tryCatch(
    async (req, res) => {

        const { username, email, password, } = req.body;

        if (
            [username, email, password].some((value) => value?.trim() === "" || value === undefined)
        ) {
            apiError(400, "all fields are required")
        }

        const exist = await User.findOne({ email });

        if (exist) {
            // if (exist.verifiedStatus === true) {
            //     apiError(409, `user with email '${email}' already existed`);
            // }

            // res.status(200).json(
            //     new apiResponse(`user account created , verify email '${email}' to continue`)
            // )
            // return;
            apiError(409, `user with email '${email}' already existed`);

        }

        const user = await User.create({
            username,
            email,
            password,
        })


        if (!user) apiError(400, "failed to create user account, try again later")

        //setting access token
        const jwtAccess = user.generateAccessToken();

        res.cookie('session_token', jwtAccess, cookieOptions)

        res.status(200).json(
            new apiResponse(
                "user account created , verify email to continue",
                {
                    username: user.username,
                    email: user.email,
                    verifiedStatus: user.verifiedStatus,
                    role: user.role,
                    purchasedCourses: user.purchasedCourses
                }
            )
        );

        return;

    }
);

//___________________________________

const emailVerificationToken = tryCatch(
    async (req, res) => {

        const user = req.user; ///comes from auth middleware

        if (user.verifiedStatus === true) apiError(400, "user already verified");

        const tokenexpiry = user?.emailVerificationToken?.expiry;

        // when token is already created
        if (Date.now() <= tokenexpiry) {   //token exist & ! expired 

            if (user.emailVerificationToken.emailLimit === 0) {

                // apiError(
                //     400,
                //     `verifiaction mail send to ${user.email}, if u still can't find it please try after ${tokenexpiry} `
                // )
                res.status(500).json(
                    new apiResponse(`try after cooldown ${tokenexpiry}`, { tokenexpiry } , false)
                )
                return
            };
            //if ratelimit not exceeds
            const verificationToken = user.generateVerificationToken(false);

            await sendVerifyMail(user.email, verificationToken);

            await user.save();

            res.status(200).json(
                new apiResponse(`verification code send to ${user.email} `)
            )
            return;
        };

        // first time creating token
        const verificationToken = user.generateVerificationToken(true);

        await user.save();

        await sendVerifyMail(user.email, verificationToken);

        res.status(200).json(
            new apiResponse(`verification mail send successfully to ${user.email}`)
        )

        return;

    }
)

//___________________________________

const verifyUserAccount = tryCatch(
    async (req, res) => {

        let user = req.user

        if (user.verifiedStatus === true) apiError(400, "user already verified");

        const { token } = req.body;

        // we know our token length is 6
        if (!token || token.trim().length !== 6) apiError(400, "verification token not provided correctly, try again");

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');


        if ( //token does not match or is expired
            user.emailVerificationToken.token !== hashedToken ||
            user.emailVerificationToken.expiry < Date.now()

        ) {
            apiError(400, "invalid verification token or expired token")

        }

        user.verifiedStatus = true;

        user.emailVerificationToken = undefined;

        user = await user.save();

        const jwtAccess = user.generateAccessToken();
        res.cookie('session_token', jwtAccess, cookieOptions);


        res.status(200).json(
            new apiResponse("User account verified successfully")
        )

        return;



    }
)

//___________________________________

const loginUser = tryCatch(
    async (req, res) => {

        const { email, password } = req.body;

        if ([email, password].some((value) => value?.trim() === "" || value == undefined)) {
            apiError(400, "username and password both required")
        };

        let user = await User.findOne({ email }).select('+password');

        if (!user) apiError("incorrect username or password");

        const isValidPass = await user.isPasswordCorrect(password);

        if (!isValidPass) apiError(400, "incorrect username or password");

        const jwtAccess = user.generateAccessToken();

        const jwtRefresh = user.generateRefreshToken();

        user = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    refreshToken: jwtRefresh
                }
            },
            {
                new: true
            }
        ).select('-emailVerificationToken -forgotPasswordToken');

        res.cookie('session_token', jwtAccess, cookieOptions);

        res.cookie('refresh_token', jwtRefresh, cookieOptions);

        res.status(200).json(
            new apiResponse("user logged in succesfully", user)
        );

        return;




    }
)

//___________________________________

const getProfile = tryCatch(
    async (req, res) => {
        const user = req.user.toObject()

        delete user.emailVerificationToken;
        delete user.forgotPasswordToken;

        res.status(200).json(
            new apiResponse("user data fetched", user)
        )
    }
)

//___________________________________

const logoutUser = tryCatch(
    async (req, res) => {

        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            }
        );

        res.status(200)
            .clearCookie("session_token", cookieOptions)
            .clearCookie("refresh_token", cookieOptions)
            .json(
                new apiResponse("logged out succesfully")
            )
    }
)

//___________________________________

const refreshAccessToken = tryCatch(
    async (req, res) => {

        const { refresh_token: incoming_refreshToken } = req.cookies;

        if (!incoming_refreshToken) apiError(400, "unauthorized access");

        const decodedToken = jwt.verify(incoming_refreshToken, process.env.JWT_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id).select('+refreshToken');

        if (!user) apiError(400, "invalid refresh token");

        if (incoming_refreshToken !== user.refreshToken) {
            apiError(400, "invalid refresh token")
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save();

        res.status(200)
            .cookie('session_token', accessToken, cookieOptions)
            .cookie('refresh_token', refreshToken, cookieOptions)
            .json(
                new apiResponse("access token refreshed successfully")
            );

        return;
    }
)

//___________________________________

const changePassword = tryCatch(
    async (req, res) => {
        const { oldPassword, newPassword } = req.body;

        if (
            [oldPassword, newPassword].some(
                (value) => value?.trim() === "" ||
                    value === undefined
            )
        ) {
            apiError(400, "old passwod and new password both required");
        }

        if(oldPassword===newPassword){
            apiError(400,"oldpassword and new password both are same!")
        }

        const user = await User.findById(req.user._id).select("+password");

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if (!isPasswordCorrect) apiError(400, "password does not match");

        user.password = newPassword;

        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save();

        res.cookie("refresh_token", refreshToken, cookieOptions);

        res.status(200).json(
            new apiResponse("password changed successfully")
        )

        return;

    }
)

//___________________________________

const forgotPassword = tryCatch(
    async (req, res)=>{

        const {email} = req.body;

        if(email ==="" || email===undefined){
            apiError(400,"email not provided correctly")
        }

        const user = await User.findOne({email});

        if(!user) apiError(400, "user not found");

        const forgotPasswordToken = user.forgotPasswordToken;

        if( forgotPasswordToken?.expiry > Date.now() ){
            
            const{expiry, token, emailLimit} = forgotPasswordToken;

            if(emailLimit===0){//rate limit exceeds
                apiError(
                    400,
                    `token send too many times ,retry after ${expiry}`
                )
            };
            //rate limit not exceeds
            const ForgotPasswordToken = user.generateForgotPasswordToken(false);

            await sendForgotPasswordMail(email,forgotPasswordToken.token);

            await user.save();

            res.status(200).json(
                new apiResponse(
                    `forgot password link send successfully ${email}`
                )
            );

            return;
            
        };

        const forgotPasstoken = await user.generateForgotPasswordToken(true);

        await sendForgotPasswordMail(email,forgotPasstoken);

        await user.save();

        res.status(200).json(
           new apiResponse(`forgot password link send successfully ${email}`)
        );
        
        return;

    }
)

//___________________________________

const resetPassword = tryCatch(
    async(req,res)=>{

        const {token} = req.params;

        const {newPassword} = req.body;

        if(
            [token, newPassword].some(
                (value)=>( value?.trim()==="" ||
                        value===undefined )
            )
        ){

            apiError(400,"newpassword or token is not send properly");
        };

        const hashedToken = crypto
                            .createHash('sha256')
                            .update(token)
                            .digest('hex');

                                
        const user = await User.findOne({
            "forgotPasswordToken.token":hashedToken,
            "forgotPasswordToken.expiry":{$gt:Date.now()}
        });

        if(!user) apiError(400,"token invalid or expired");

        user.password = newPassword;

        user.forgotPasswordToken = undefined;

        user.refreshToken = undefined;

        await user.save();

        res.status(200).json(
            new apiResponse("password reset successfully")
        );

        return;

    }
)

//___________________________________

const updateUserAvatarImage = tryCatch(
    async (req,res)=>{
        let user = req.user;
        
        const avatarLocalPath = req.file?.path;

        if(!avatarLocalPath) apiError(400,"avatar file is missing");
                       
        const avatar = await uploadCloudinary(avatarLocalPath,"image",profileImgConfig);

        if(!avatar) apiError(400,"failed to upload avatar");

        if(user.profileImage.public_id ){//if avatar already present 
         
            const res=await cloudinary.uploader.destroy(
                user.profileImage.public_id 
            );

            if(res.result==="not found") apiError(400,"failed to delete previous image")
        }

        user = await User.findByIdAndUpdate(
            user._id,
            {
                $set:{
                    profileImage:{
                        public_id:avatar.public_id,
                        secure_url:avatar.secure_url
                    }
                }
            },
            {
                new:true
            }
        ).select("-forgotPasswordToken");

        res.status(200).json(
            new apiResponse("avatar image updated successfully",user)
        )

        return;       

    }
)

//___________________________________

const updateUserDetails = tryCatch(
    async(req, res)=>{
        const {username} = req.body;

        if(username?.trim()==="" || username===undefined) apiError(400,"username not provided");

        if(username ===req.user.username){
            apiError(400,"provide different username than previously used");
        }
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    username:username
                }
            },
            {
                new:true
            }
        ).select("-forgotPasswordToken");

        if(!user) apiError(400,"failed to update username");

        res.status(200).json(
            new apiResponse("username updated successfully",user)
        )
    }
)

export {
    registerUser,
    emailVerificationToken,
    verifyUserAccount,
    loginUser,
    getProfile,
    logoutUser,
    refreshAccessToken,
    changePassword,
    forgotPassword,
    resetPassword,
    updateUserAvatarImage,
    updateUserDetails

}