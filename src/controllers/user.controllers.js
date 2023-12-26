import apiResponse from "../utils/apiResponse.js";
import tryCatch from "../utils/tryCatch.js"
import apiError from "../utils/apiError.js"
import User from "../models/user.model.js";
import { sendVerifyMail } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendEmail.js";




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



const emailVerificationToken = tryCatch(
    async (req, res) => {

        const { email } = req.params;

        if (email.trim() === "" || email === undefined) {
            apiError(400, "email required");
        }

        const user = await User.findOne({ email }).select("+emailVerificationToken");

        if (!user) apiError(400, "user does not exist");

        if (user.verifiedStatus === true) apiError(400, "user already verified");

        const tokenexpiry = user?.emailVerificationToken?.expiry;

        // when token is already created
        if (Date.now() <= tokenexpiry) {   //token exist & ! expired 

            if (user.emailVerificationToken.emailLimit === 0) {

                apiError(
                    400,
                    `verifiaction mail send to ${email}, if u still can't find it please try after ${tokenexpiry} `
                )
            };
            //if ratelimit not exceeds
            const verificationToken = user.generateVerificationToken(false);

            await sendVerifyMail(user.email, verificationToken);

            await user.save();



            res.status(200).json(
                new apiResponse(`verification code send to ${email} `)
            )
            return;
        };

        // first time creating token
        const verificationToken = user.generateVerificationToken(true);

        await user.save();

        await sendVerifyMail(user.email, verificationToken);

        res.status(200).json(
            new apiResponse(`verification mail send successfully to ${email}`)
        )

        return;

    }
)


export {
    registerUser,
    emailVerificationToken
}