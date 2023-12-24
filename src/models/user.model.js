import mongoose,{Schema} from "mongoose";

const userSchema=new Schema({
    username:{
        type:String,
        required:[true,'userName is required'],
        trim:true,
    },
    email:{
        type:String,
        required:[true,'email is required'],
        unique:true,
        trim:true,
        lowercase:true,
        match:[/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email']
    },
    password:{
        type:String,
        required:[true,"Password is Required"],
        minlength:[8,"password must be at least of 8 characters"],
        maxlength:[60,'password must be less than 62 characters'],
        select:false
        
    },
    verifiedStatus:{
        type:Boolean,
        default:false
    },
    verificationToken:{
        type:String,
        required:true,
        select:false
    },
    role:{
        type:String,
        default:"USER"
    },
    refreshToken:{
        type:String,
        select:false
    },
    forgetPasswordToken:{
        token:{
            type:String
        },
        expiry:{
            type:Date
        },
        select:false
    },
    purchasedCourses:[{
        type:String
    }]

})

const User = mongoose.model("User",userSchema);
export default User