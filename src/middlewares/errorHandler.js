export default function errorHandler(err,req,res,next){
    res.status(err.errorCode || 500 ).json({
        success:false,
        message:err.message
    })
    
}