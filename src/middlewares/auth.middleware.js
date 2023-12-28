import User from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import tryCatch from "../utils/tryCatch.js";
import jwt from "jsonwebtoken";


const isLoggedIn= (flag=true)=>tryCatch(

    async(req,res,next)=>{
        
        const {session_token} = req.cookies;

        if(!session_token) apiError(400,"unauthenticated please login");

        const decoded_token = jwt.verify(session_token, process.env.JWT_TOKEN_SECRET);

        const user = await User.findById(decoded_token?._id);

        if(!user) apiError(400,"invalid access token");
        
        if(flag && user.verifiedStatus ===false){ //flag by default true
            apiError(400,"user account not verifed please verfy to get access to this resource")
        }

        req.user = user;

        next();

    }

)


export {
    isLoggedIn
}