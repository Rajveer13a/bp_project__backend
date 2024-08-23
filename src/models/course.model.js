import mongoose , {Schema} from "mongoose";

const courseSchema = new Schema({
    instructor_id:{
        type:Schema.Types.ObjectId,
        ref:"Instructor"
    },
    sections:[
        {
            type:Schema.Types.ObjectId
        }
    ]
    ,
    title:{
        type:String,
        required:true,
        minlength:[1,"title needs to be more than 10 words"],
        maxlength:[100,"title needs to be less than 100 words"]
    },
    thumbnail:{
        public_id:{
            type:String,
            // required:true
        },
        secure_url:{
            type:String,
            // required:true
        },
        
    },
    category:{
        type: String,
        required : true,
        enum: ["Music", "Development", "Business", "Finance", "Accounting", "IT & Software", "Office Productivity", "Personal Development", "Design", "Marketing", "Lifestyle", "Photography & Video", "Health & Fitness", "Teaching & Academics", "I don't know yet"] 
    },
    price:{
        type:Number,
        // required:true
    },
    description:{
        type:String,
        // required:true,
        minlength:[200,"description needs to be more than 200 words"],
        maxlength:[600,"description needs to be less than 600 words"]
    },
    approved:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        select: false
    },
    updatedAt: {
        type: Date,
        select: false
    },
    __v: {
        type: Number,
        select: false
    },
    
});

const Course = mongoose.model("Course",courseSchema);

export default  Course;