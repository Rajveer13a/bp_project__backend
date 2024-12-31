import sendEmail from "./sendEmail.js";

async function sendVerifyMail(email,token ){
    const subject="Account Verification For BrainyPath app";

    const message=`this is 6 digit code  ${token}`;
    const htmlMessage = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <h1 style="color: #1E90FF; font-weight: bold;">BrainyPath</h1>
            <h2>Account Verification</h2>
            <p>Thank you for registering with BrainyPath. Please use the following 6-digit code to verify your account:</p>
            <h1 style="color: #4CAF50;">${token}</h1>
            <p>If you did not request this, please ignore this email.</p>
        </div>
    `;

    return await sendEmail(email, subject, htmlMessage);
    
    return await sendEmail(email,subject,message);
}


async function sendForgotPasswordMail(email,forgotPasstoken ){
    const subject="Forgot password for BrainyPath app";

    const message=`click on the link to change password ${forgotPasstoken}`;
    const htmlMessage = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <h1 style="color: #1E90FF; font-weight: bold;">BrainyPath</h1>
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Please click the link below to reset your password:</p>
            <a href="${process.env.FRONTEND_URL}/reset-password/${forgotPasstoken}" style="color: #4CAF50;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        </div>
    `;

    return await sendEmail(email, subject, htmlMessage);
    
    return await sendEmail(email,subject,message);
}





export{
    sendVerifyMail,
    sendForgotPasswordMail
};