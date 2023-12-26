import sendEmail from "./sendEmail.js";

async function sendVerifyMail(email,token ){
    const subject="Account Verification For Online Learning app";

    const message=`this is your verification token  ${token}`;
    
    return await sendEmail(email,subject,message);
}
export{
    sendVerifyMail
};