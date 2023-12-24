import mongoose,{Schema} from "mongoose";

const enrollmentSchema = new Schema({
    user_id:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    course_id:{
        type:Schema.Types.ObjectId,
        ref:"Course"
    },
    enrolledAt:{
        type:Date,
        default:Date.now(),
        mutable:false
    }
});

const Enrollment = mongoose.model("Enrollment",enrollmentSchema);

export default Enrollment;