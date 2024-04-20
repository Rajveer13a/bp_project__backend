import dotenv from "dotenv"
import app from "./app.js";
import connectDb from "./db/dbConnection.js";
import Razorpay from "razorpay";


dotenv.config({
    path:"./.env"
})

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

const port= process.env.PORT;

app.listen(port,()=>{
    connectDb();
    console.log(`\nserver is running at port http://127.0.0.1:${port}`)
})

