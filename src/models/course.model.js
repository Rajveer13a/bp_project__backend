import mongoose, { Schema } from "mongoose";
import { priceList } from "../constants.js";


const courseSchema = new Schema({
    instructor_id: {
        type: Schema.Types.ObjectId,
        ref: "Instructor"
    },
    sections: [
        {
            type: Schema.Types.ObjectId
        }
    ]
    ,
    title: {
        type: String,
        required: true,
        minlength: [1, "title needs to be more than 10 words"],
        maxlength: [100, "title needs to be less than 100 words"]
    },
    subtitle: {
        type: String,
        // required: true,
        minlength: [5, "subtitle needs to be moder than 5 words"],
        maxlength: [500, "title needs to be less than 500 words"]
    },
    language: {
        type: String,
        enum: [
            "english",
            "spanish",
            "mandarin",
            "hindi",
            "french",
            "arabic",
            "bengali",
            "portuguese",
            "russian"
        ]
    },

    level: {
        type: String,
        enum: ["beginner", "intermediate", "expert", "all"]
    },

    trailerVideo: {
        public_id: {
            type: String,
            // required:true
        },
        secure_url: {
            type: String,
            // required:true
        },
    },

    thumbnail: {
        public_id: {
            type: String,
            // required:true
        },
        secure_url: {
            type: String,
            // required:true
        },

    },
    category: {
        type: String,
        required: true,
        enum: [
            "music",
            "development",
            "business",
            "finance",
            "accounting",
            "it-software",
            "office-productivity",
            "personal-development",
            "design",
            "marketing",
            "lifestyle",
            "photography-video",
            "health-fitness",
            "teaching-academics"
        ]
    },
    price: {
        type: Number,
        // required:true
        enum: priceList
    },
    description: {
        type: String,
        // required:true,
        minlength: [200, "description needs to be more than 200 words"],
        maxlength: [10000, "description needs to be less than 10000 words"]
    },
    goals: {
        objectives: {
            type : [String],
            default: ["","","",""]
        },
        prerequisites: {
            type : [String],
            default:[""]
        },
        intended_learners: {
            type : [String],
            default:[""]
        }
    },
    approved: {
        type: Boolean,
        default: false
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
    },

});

const Course = mongoose.model("Course", courseSchema);

export default Course;