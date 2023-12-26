import mongoose,{Schema} from "mongoose";

const instructorSchema = new Schema({
    user_id:{
        type:Schema.Types.ObjectId,
        ref:"USER",
        require:true
    },
    bio:{
        type:String,
        minlength:[20,"bio should be of at least 20 words"],
        maxlength:[100,"bio should be less than 100 words "],
        trim:true
    },
    profileImage:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
    }
})

const Instructor = mongoose.model("Instructor",instructorSchema);

export default Instructor;