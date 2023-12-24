import dotenv from "dotenv"
import app from "./app.js";
import connectDb from "./db/dbConnection.js";

dotenv.config({
    path:"./.env"
})

const port= process.env.PORT;

app.listen(port,()=>{
    connectDb();
    console.log(`\nserver is running at port http://127.0.0.1:${port}`)
})

