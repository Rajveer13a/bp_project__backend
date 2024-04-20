export default function errorHandler(err,req,res,next){
    console.log(err)
    res.status(err.errorCode || 500 ).json({
        success:false,
        message:err.message
    })
    
}