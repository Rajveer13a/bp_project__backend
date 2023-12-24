import mongoose , {Schema} from "mongoose";

const courseSchema = new Schema({
    instructor_id:{
        type:Schema.Types.ObjectId,
        ref:"Instructor"
    },
    thumbnail:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        },
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true,
        minlength:[200,"description needs to be more than 200 words"],
        maxlength:[600,"description needs to be less than 600 words"]
    },
    approved:{
        type:Boolean,
        default:false
    },
    sections:[{
        type:Schema.Types.ObjectId,
        ref:"Section"
    }]
});

const Course = mongoose.model("Course",courseSchema);

export default  Course;