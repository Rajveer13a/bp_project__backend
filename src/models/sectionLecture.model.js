import mongoose,{Schema} from "mongoose";

const lectureSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        minlength:[14,"title should be greater than 14 words"],
        maxlength:[30,"title should be less than 30 words"],
    },
    video:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
    },
    approved:{
        type:Boolean,
        default:false 
    }
});

const Lecture = mongoose.model("Lecture",lectureSchema);

export default Lecture;