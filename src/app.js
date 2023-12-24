import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.js";
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

app.get("/ping",(req,res)=>{
    res.send("Pong from server")
} )

app.use(errorHandler)

export default app;