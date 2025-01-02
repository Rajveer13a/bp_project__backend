import mongoose, { Schema } from "mongoose";

const instructorSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "USER",
        require: true
    },
    bio: {
        type: String,
        minlength: [20, "bio should be of at least 20 words"],
        maxlength: [3000, "bio should be less than 3000 words "],
        trim: true
    },
    profileCompleted: {
        status: {
            type: Boolean,
            default:false
        },
        step: {
            type: Number,
            default: 1
        }
    },
    headline: {
        type: String
    },
    language: {
        type: String,
        default:"en"
    },
    social: {
        facebook: String,
        linkedIn: String,
        twitter: String,
        youtube: String
    },
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
},
    { timestamps: true })

const Instructor = mongoose.model("Instructor", instructorSchema);

export default Instructor;