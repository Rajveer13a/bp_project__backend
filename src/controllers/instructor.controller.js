import apiError from "../utils/apiError.js";
import tryCatch from "../utils/tryCatch.js";
import Instructor from "../models/instructor.model.js";
import User from "../models/user.model.js";
import apiResponse from "../utils/apiResponse.js";
import Course from "../models/course.model.js";
//-------------------------------------

const createInstructor = tryCatch(
    async (req, res) => {
        let user = req.user;

        if (["ADMIN", "INSTRUCTOR", "MODES"].includes(user.role)) {
            apiError(400, `user role is ${(user.role).toLowerCase()} ,cannot make user instructor`);
        };

        // const { bio } = req.body;

        // if( bio?.trim()==="" || bio ===undefined ){
        //     apiError(400,"bio is must");
        // };

        let instructor = await Instructor.create({
            user_id: user._id,
            // bio,
        });

        if (!instructor) apiError(400, "failed to create instructor");

        user = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    role: "INSTRUCTOR"
                }
            }, {
            new: true
        }
        ).select("-forgotPasswordToken");

        if (!user) apiError(400, "failed save role as instructor");

        instructor = instructor.toObject();

        instructor.user_id = user;

        res.status(200).json(
            new apiResponse("sucessfully setted user as instructor", instructor)
        );

        return;

    }
);

//-------------------------------------

const getInstructorDetails = tryCatch(
    async (req, res) => {
        let user = req.user;

        let instructor = await Instructor.findOne({
            user_id: user._id
        });
        
        if (!instructor) apiError(400, "instructor not found");

        let courses = await Course.aggregate([
            {
                $match: {
                    instructor_id: instructor._id
                }
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "course_id",
                    as: "review"
                }
            },
            {
                $unwind: {
                    path: "$review",
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $project: {
                    "instructor_id": 0,
                    "__v": 0,
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

        instructor = instructor.toObject();
        
        instructor.courses = courses;

        user = user.toObject();

        delete user.forgotPasswordToken;

        user.instructor = instructor;
        
        res.status(200).json(
            new apiResponse("instructor details fetched successfully", user)
        )

    }
);

//-------------------------------------

const updateInstructorDetails = tryCatch(
    async (req, res) => {
        const { bio, headline } = req.body;

        if ([bio, headline].some(value => value == undefined || value?.trim == "")) {

            apiError(400, "required fields are not given");
        }

        const instructor = await Instructor.findOneAndUpdate(
            req.instructor._id,
            {
                $set: {
                    bio,
                    headline
                }
            }, {
            new: true
        }
        );

        if (!instructor) apiError(400, "failed to update");

        if (!instructor.profileCompleted.status) {
            instructor.profileCompleted.step = 2;

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