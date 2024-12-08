import mongoose,{Schema} from "mongoose";

const lectureSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        minlength:[5,"title should be greater than 14 words"],
        maxlength:[80,"title should be less than 80 words"],
    },
    instructor_id:{
        type:Schema.Types.ObjectId,
        require:true
    },
    section_id:{
        type:Schema.Types.ObjectId,
        require:true
    },
    type:{
        type:String
    },
    description:{
        type:String,
        minlength:[10,"description should be greater than 14 words"],
        maxlength:[30,"description should be less than 30 words"],
    },
    resource:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        },
        duration:{
            type:Number
        },
        thumbnail:{
            type: String
        },
        filename:{
            type:String
        }
    },
    approved:{
        type:Boolean,
        default:false 
    },
    feedback:{
        type:"String"
    },
    __v:{
        type:Number,
        required:false
    }
},{ timestamps: true });

const Lecture = mongoose.model("Lecture",lectureSchema);

export default Lecture;