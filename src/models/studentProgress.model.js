import mongoose, { Schema } from "mongoose"

const studentProgressSchema = new Schema({
    course_id: {
        type : mongoose.Schema.ObjectId,
        required : true,
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        required : true
    },

    completed: {
        type: [[Boolean]],
        required : true
    },

    lastView: {
        section_no: Number,
        lecture_no: Number,
        // required : true
    }
   
}, {timestamps: true})

const StudentProgress  = mongoose.model("StudentProgress", studentProgressSchema);

export default StudentProgress;