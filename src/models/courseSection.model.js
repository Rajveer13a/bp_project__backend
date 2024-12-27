import mongoose,{Schema} from "mongoose";

const sectionSchema = new Schema({
    title:{
        type:String,
        require:true,
        trim:true
    },
    learningObjective:{
        type:String,
        require:true,
        trim:true
    },
    course_id:{
        type:Schema.Types.ObjectId,
        require:true
    },
    instructor_id:{
        type:Schema.Types.ObjectId,
        require:true
    },
    __v:{
        type:Number,
        select:false
    },
    createdAt:{
        type:Date,
        select:false
    },
    updatedAt:{
        type:Date,
        select:false
    }
    
},{timestamps:true});

const Section =  mongoose.model("Section",sectionSchema);

export default Section;