import jwt from "jsonwebtoken"

export default function errorHandler(err,req,res,next){
    // console.log(err)
    if(err instanceof jwt.TokenExpiredError){
        res.status(err.errorCode || 401 ).json({
            success:false,
            message:err.message
        })
    }
    res.status(err.errorCode || 500 ).json({
        success:false,
        message: err.message || err.error.description 
    })
    
}