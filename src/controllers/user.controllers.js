import apiResponse from "../utils/apiResponse.js";
import tryCatch from "../utils/tryCatch.js"
import apiError from "../utils/apiError.js"
import User from "../models/user.model.js";
import { sendVerifyMail } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { randomByteSize } from "../constants.js";

const cookieOptions = {
    httpOnly: true,
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
            if (exist.verifiedStatus === true) {
                apiError(409, `user with email '${email}' already existed`);
            }

            res.status(200).json(
                new apiResponse(`user account created , verify email '${email}' to continue`)
            )
            return;

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

                apiError(
                    400,
                    `verifiaction mail send to ${user.email}, if u still can't find it please try after ${tokenexpiry} `
                )
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
    async (req,res)=>{

        const { email, password } = req.body;

        if([ email, password ].some((value)=>value?.trim()==="" || value==undefined ) ){
            apiError(400,"username and password both required")
        };

        let user = await User.findOne({email}).select( '+password' );

        if(!user) apiError("incorrect username or password");

        const isValidPass = await user.isPasswordCorrect(password);

        if( !isValidPass ) apiError(400,"incorrect username or password");

        const jwtAccess = user.generateAccessToken();

        const jwtRefresh = user.generateRefreshToken();

        user = await User.findByIdAndUpdate(
            user._id,
            {
                $set:{
                    refreshToken:jwtRefresh
                }
            },
            {
                new:true
            }
        ).select( '-emailVerificationToken' );

        res.cookie( 'session_token', jwtAccess, cookieOptions );

        res.cookie( 'refresh_token', jwtRefresh, cookieOptions );

        res.status(200).json(
            new apiResponse("user logged in succesfully", user)
        );
        
        return;
        



    }
)

//___________________________________

const getProfile = tryCatch(
    async (req, res)=>{
        const user = req.user.toObject()
        
        delete user.emailVerificationToken;

        res.status(200).json(
            new apiResponse("user data fetched",user)
        )
    }
)

//___________________________________

const logoutUser = tryCatch(
    async (req, res)=>{

        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset:{
                    refreshToken:1
                }
            }
        );

        res.status(200)
            .clearCookie("session_token",cookieOptions)
            .clearCookie("refresh_token",cookieOptions)
            .json(
                new apiResponse("logged out succesfully")
            )
    }
)



export {
    registerUser,
    emailVerificationToken,
    verifyUserAccount,
    loginUser,
    getProfile,
    logoutUser
}