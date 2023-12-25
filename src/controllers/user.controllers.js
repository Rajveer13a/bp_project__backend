import apiResponse from "../utils/apiResponse.js";
import tryCatch from "../utils/tryCatch.js"
import apiError from "../utils/apiError.js"
import User from "../models/user.model.js";
import crypto from "crypto"
import { sendVerifyMail } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendEmail.js";




const registerUser = tryCatch(
    async (req, res) => {

        const { username, email, password, } = req.body;

        if(
            [username, email, password].some((value)=>  value?.trim()==="" || value===undefined ) 
        ){
            apiError(400,"all fields are required")
        }
        
        const exist = await User.findOne({ email });

        if(exist){
            if(exist.verifiedStatus === true){
                apiError(409,`user with email '${email}' already existed`);
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


        if(!user) apiError(400,"failed to create user account, try again later")

        res.status(200).json(
            new apiResponse(
                "user account created , verify email to continue",
                {
                    username:user.username,
                    email:user.email,
                    verifiedStatus:user.verifiedStatus,
                    role:user.role,
                    purchasedCourses:user.purchasedCourses
                }
            )
        );
        
        return;

    }
);


export {
    registerUser
}