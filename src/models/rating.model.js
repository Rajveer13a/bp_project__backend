import mongoose, { Schema } from "mongoose"

const ratingSchema = new Schema({
    course_id: {
        type : mongoose.Schema.ObjectId,
        required : true
    },
    rating: {
        type: Number,
        required : true,
        enum: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        required : true
    },
    comment: {
        type: String,
        maxlength: [1000, "comment should not be more than 1000 words"]
    }
   
}, {timestamps: true})

const Rating  = mongoose.model("Rating", ratingSchema);

export default Rating;