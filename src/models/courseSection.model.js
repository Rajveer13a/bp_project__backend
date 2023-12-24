import mongoose,{Schema} from "mongoose";

const sectionSchema = new Schema({
    title:{
        type:String,
        require:true,
        trim:true
    },
    lectures:[{
        type:Schema.Types.ObjectId,
        ref:"Lecture"
    }]
    
});

const Section =  mongoose.model("Section",sectionSchema);

export default Section;