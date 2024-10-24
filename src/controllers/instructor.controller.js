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
                $match: {
                    user_id: user._id
                }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "instructor_id",
                    as: "courses"
                }
            },
            {
                $unwind: "$courses"
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "courses._id",
                    foreignField: "course_id",
                    as: "courses.reviews"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    courses: { $push: "$courses" },
                    user_id: { $first: "$user_id" }
                }
            },
            {
                $project: {
                    "courses.instructor_id": 0,
                    "courses.__v": 0,
                    "courses.reviews.__v": 0,
                    "courses.reviews.reviewedBy": 0,
                    "courses.reviews.landing": 0,
                    "courses.reviews.intended": 0,
                    "courses.reviews.feeback": 0,
                    "courses.reviews._id": 0,
                    "__v": 0,
                    "user_id": 0
                }
            }
        ]);
        

        if(!instructor[0]) apiError(400,"instuctor not found");

        user = user.toObject();

        delete user.forgotPasswordToken;

        user.instructor = instructor[0];

        res.status(200).json(
            new apiResponse("instructor details fetched successfully",user)
        )

    }
);

//-------------------------------------

const updateInstructorDetails = tryCatch(
    async(req, res)=>{
        const {bio, headline} =req.body;
        
        if( [bio,headline].some(value=> value==undefined || value?.trim=="")){
            
            apiError(400,"required fields are not given");
        }

        const instructor = await Instructor.findOneAndUpdate(
            req.instructor._id,
            {
                $set:{
                    bio,
                    headline
                }
            },{
                new:true
            }
        );

        if(!instructor) apiError(400,"failed to update");

        if(!instructor.profileCompleted.status){
            instructor.profileCompleted.step  =2;

            await instructor.save()
        }

        res.status(200).json(
            new apiResponse("updated succesfully")
        );

        
    }
)



export {
    createInstructor,
    getInstructorDetails,
    updateInstructorDetails

}