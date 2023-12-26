import nodemailer from "nodemailer";
import { mailName } from "../constants.js";

const sendEmail = async function(email,subject,message){
    const transporter = nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        secure:false,
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASSWORD
        }
    });

    return await transporter.sendMail({
        from: {
            name:mailName,
            address:process.env.SMTP_USER
        },
        to: email,
        subject: subject,
        html: message
    })
}


export default sendEmail

