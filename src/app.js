import express from "express";

const app = express();


app.get("/ping",(req,res)=>{
    res.send("Pong from server")
} )

export default app;