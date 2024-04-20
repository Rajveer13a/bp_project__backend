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
            default: false
        },

        reviewedBy:{
            type: Schema.Types.ObjectId
        },

        feedback:{
            type: String
        },

        approved:{
            type: Boolean
        }
    }
);

const Review = mongoose.model("Review",reviewSchema);

export default Review;