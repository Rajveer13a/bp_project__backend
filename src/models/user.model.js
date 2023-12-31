import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto"
import { emailLimit, emailVerificationToken_expiry, forgotPassword_emailLimit, forgotPassword_expiry, randomByteSize } from "../constants.js";
import jwt from "jsonwebtoken";

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
        emailLimit: {
            type: Number,
            // default: emailLimit
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
    forgotPasswordToken: {

        token: {
            type: String
        },
        expiry: {
            type: Date
        },
        emailLimit:{
            type:Number
        }
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
    },
    profileImage:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
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
 
    let verificationToken = Math.floor(Math.random() * 900000) + 100000;
    verificationToken = verificationToken.toString(); //6 digit otp

    this.emailVerificationToken.token = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    if (flag) { //is flag is true set  new date and reset email limit
        this.emailVerificationToken.expiry = Date.now() + emailVerificationToken_expiry;
        this.emailVerificationToken.emailLimit = emailLimit - 1;
    } else {
        this.emailVerificationToken.emailLimit = this.emailVerificationToken.emailLimit - 1;
    }


    return verificationToken;
};


userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            verifiedStatus: this.verifiedStatus,
            role: this.role,
            purchasedCourses: this.purchasedCourses
        },

        process.env.JWT_TOKEN_SECRET,

        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            verifiedStatus: this.verifiedStatus,
            role: this.role,
            purchasedCourses: this.purchasedCourses
        },

        process.env.JWT_TOKEN_SECRET,

        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateForgotPasswordToken =function (flag){

    const createdPasswordToken = crypto.randomBytes(randomByteSize).toString('hex');

    this.forgotPasswordToken.token = crypto
                                    .createHash('sha256')
                                    .update(createdPasswordToken)
                                    .digest('hex');
    
    if(flag){
        this.forgotPasswordToken.expiry = Date.now() + forgotPassword_expiry;
        this.forgotPasswordToken.emailLimit = forgotPassword_emailLimit-1;
    }else{
        this.forgotPasswordToken.emailLimit = this.forgotPasswordToken.emailLimit-1;
    }

    return createdPasswordToken;


    
}

const User = mongoose.model("User", userSchema);
export default User