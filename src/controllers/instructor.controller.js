import apiError from "../utils/apiError.js";
import tryCatch from "../utils/tryCatch.js";
import Instructor from "../models/instructor.model.js";
import User from "../models/user.model.js";
import apiResponse from "../utils/apiResponse.js";

//-------------------------------------

const createInstructor = tryCatch(
    async(req,res)=>{
        let user = req.user;
        
        if( ["ADMIN","INSTRUCTOR","MODES"].includes(user.role) ){
            apiError(400,`user role is ${(user.role).toLowerCase()} ,cannot make user instructor`);
        };

        const { bio } = req.body;

        if( bio.trim()==="" || bio ===undefined ){
            apiError(400,"bio is must");
        };

        let instructor = await Instructor.create({
            user_id: user._id,
            bio,
        });

        if(!instructor) apiError(400,"failed to create instructor");

        user = await User.findByIdAndUpdate(
            user._id,
            {
                $set:{
                    role:"INSTRUCTOR"
                }
            },{
                new:true
            }
        ).select("-forgotPasswordToken");

        if(!user) apiError(400,"failed save role as instructor");
        
        instructor = instructor.toObject();

        instructor.user_id = user ;
        
        res.status(200).json(
            new apiResponse("sucessfully setted user as instructor",instructor)
        );
        
        return;

    }
);

//-------------------------------------

const getInstructorDetails =tryCatch(
    async (req,res)=>{
        let user = req.user;

        let instructor = await Instructor.aggregate([
            {
                $match:{
                    user_id:user._id
                }
            },
            {
                $lookup:{
                    from: "courses",
                    localField: "_id",
                    foreignField: "instructor_id",
                    as: "courses"
                }
            },
            {
                $project:{
                    "courses.instructor_id": 0,
                    "__v": 0,
                    "user_id":0
                }
            }
        ]);

        if(!instructor) apiError(400,"instuctor not found");

        user = user.toObject();

        delete user.forgotPasswordToken;

        user.instructor = instructor[0];

        res.status(200).json(
            new apiResponse("instructor details fetched successfully",user)
        )

    }
);

//-------------------------------------

export {
    createInstructor,
    getInstructorDetails

}