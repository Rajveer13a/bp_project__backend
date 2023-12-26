import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto"
import { emailLimit, emailVerificationToken_expiry, randomByteSize } from "../constants.js";

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'userName is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, "Password is Required"],
        minlength: [8, "password must be at least of 8 characters"],
        maxlength: [60, 'password must be less than 62 characters'],
        select: false

    },
    verifiedStatus: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        token: {
            type: String,
        },
        expiry: {
            type: Date,
        },
        emailLimit:{
            type:Number,
            default:emailLimit
        }
    },
    role: {
        type: String,
        default: "USER"
    },
    refreshToken: {
        type: String,
        select: false
    },
    forgetPasswordToken: {
        type: Object,
        token: {
            type: String
        },
        expiry: {
            type: Date
        },
        select: false
    },
    purchasedCourses: [{
        type: String,
    }],
    createdAt: {
        type: Date,
        select: false
    },
    updatedAt: {
        type: Date,
        select: false
    },
    __v: {
        type: Number,
        select: false
    }

}, {
    timestamps: true,

});


userSchema.pre('save', async function (next) {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();
});

userSchema.methods.generateVerificationToken = function (flag) {
    const verificationToken = crypto.randomBytes(randomByteSize).toString('hex');

    this.emailVerificationToken.token = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    if(flag){ //is flag is true set  new date and reset email limit
        this.emailVerificationToken.expiry = emailVerificationToken_expiry
        this.emailVerificationToken.emailLimit = emailLimit-1 ;
    }else{
        this.emailVerificationToken.emailLimit = this.emailVerificationToken.emailLimit-1  ;
    }
    

    return verificationToken;
};


const User = mongoose.model("User", userSchema);
export default User