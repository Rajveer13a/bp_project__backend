import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        course_id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        
        user_id: {
            type: Schema.Types.ObjectId,
        },

        instructorName: {
            type: String,
            required: true
        },        

        reviewed:{
            type: Boolean,
            require: true,
            default: null
        },

        feedback:{
            type: String
        }
    }
);

const Review = mongoose.model("Review",reviewSchema);

export default Review;