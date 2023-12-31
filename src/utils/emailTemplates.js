import sendEmail from "./sendEmail.js";

async function sendVerifyMail(email,token ){
    const subject="Account Verification For Online Learning app";

    const message=`this is 6 digit code  ${token}`;
    
    return await sendEmail(email,subject,message);
}


async function sendForgotPasswordMail(email,forgotPasstoken ){
    const subject="forgot password for Online Learning app";

    const message=`click on the link to change password ${forgotPasstoken}`;
    
    return await sendEmail(email,subject,message);
}





export{
    sendVerifyMail,
    sendForgotPasswordMail
};