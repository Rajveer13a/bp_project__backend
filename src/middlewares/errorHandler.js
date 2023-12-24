export default function errorHandler(err,req,res,next){
    res.status(err.errorCode).json({
        success:false,
        message:err.message
    })
    
}