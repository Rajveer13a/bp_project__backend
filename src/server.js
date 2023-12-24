import dotenv from "dotenv"
import app from "./app.js";

dotenv.config({
    path:"./.env"
})

const port= process.env.PORT
app.listen(port,()=>{
    console.log(`servert is running at port http://127.0.0.1:${port}`)
})

