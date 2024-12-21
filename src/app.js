import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.js";

//--------------------------------------------------

const app = express();

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))

app.use(express.json({limit:'16kb'}));

app.use(express.urlencoded({limit:'16kb',extended:true}));

app.use(cookieParser())

// using routes

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user",userRouter);

//----------------------------------

import instructorRouter from "./routes/instructor.routes.js";

app.use("/api/v1/instructor", instructorRouter);

//-------------------------------------

import courseRouter from "./routes/course.routes.js";

app.use("/api/v1/course",courseRouter);

//----------------------------------

import managementRouter from "./routes/management.routes.js";

app.use("/api/v1/manage",managementRouter);


//----------------------------------

import studentRouter from "./routes/students.routes.js";

app.use("/api/v1/student",studentRouter);

//----------------------------------

import paymentRouter from "./routes/payment.routes.js";

app.use("/api/v1/payment",paymentRouter);

//----------------------------------

import revenueSharerouter from "./routes/revenueShare.routes.js";

app.use("/api/v1/payouts", revenueSharerouter)
//----------------------------------


import searchRouter from "./routes/search.routes.js";

app.use("/api/v1/search", searchRouter)
//----------------------------------


app.get("/ping",(req,res)=>{
    res.send("Pong from server")
} )

app.all('*',(req,res)=>{
    res.status(404).send("invalid path")
});

app.use(errorHandler);

export default app;