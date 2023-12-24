import mongoose from "mongoose";
import { DbName } from "../constants.js";

async function connectDb(){
    try {
        const connectionInstance= await mongoose.connect(`${process.env.MONGO_URI}/${DbName}`);
    
        console.log(`\nMongoDB connected , DB Host: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log(`${process.env.MONGO_URI}/`,DbName)
        console.log("MongoDb connection failed =>>> ",error.message);

        process.exit(1);
    }
}

export default connectDb;