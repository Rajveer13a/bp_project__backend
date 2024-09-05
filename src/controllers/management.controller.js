import mongoose, { mongo } from "mongoose";
import Course from "../models/course.model.js";
import Review from "../models/courseReview.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import tryCatch from "../utils/tryCatch.js";
import User from "../models/user.model.js";

const getCourses = tryCatch(
    async (req, res) => {

        const courses = await Review.find({});

        if (!courses) apiError(400, "error occured when fetching courses");

        res.status(200).json(
            new apiResponse("courses fetched successfully", courses)
        );

    }
);

const courseDetail = tryCatch(
    async (req, res) => {

        const { course_id } = req.query;

        if (!course_id || course_id?.trim() == "") apiError(400, "course id not given");

        const review = await Review.findOne({
            course_id: course_id
        });

        if (!review) apiError(400, "course not exist");

        const course = await Course.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(course_id)
                }
            },
            {
                $lookup: {
                    localField: "_id",
                    foreignField: "course_id",
                    from: "sections",
                    as: "sections",
                    pipeline: [
                        {
                            $sort: {
                                createdAt: 1
                            }
                        },
                        {
                            $lookup: {
                                localField: "_id",
                                foreignField: "section_id",
                                from: "lectures",
                                as: "lectures",
                                pipeline: [
                                    {
                                        $sort: {
                                            createdAt: 1
                                        }
                                    },
                                    {
                                        $project: {
                                            createdAt: 0,
                                            updatedAt: 0,
                                            instructor_id: 0,
                                            section_id: 0,
                                            __v: 0
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    sections: {
                        course_id: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        __v: 0,
                        instructor_id: 0
                    },
                    __v: 0,

                }
            }
        ]);

        if (!course) apiError(400, "course not found");

        res.status(200).json(
            new apiResponse("course detail fetched successfully", course)
        )

    }
);

const reviewing = tryCatch(
    async(req, res)=>{

        const { feedback, flag, course_id } = req.body;

        if( [feedback, flag, course_id].some(
            value => value === undefined ||
                    value?.trim() === ""
        )){
            apiError(400,"all fields are required")
        };

        const review = await Review.findOneAndUpdate(
            {
                course_id: course_id
            },{
                $set:{
                    feedback:feedback,
                    reviewed:true,
                    approved: flag,
                    reviewedBy: req.user._id
                }
            },
            {
                new: true
            }
        );

        if( !review ) apiError(400,"failed to update review state");

        const updatedCourse = await Course.findByIdAndUpdate(
            course_id,
            {
                approved: flag
            },{
                new: true
            }
        );

        if( !updatedCourse ) apiError(400, "failed to change course state");

        res.status(200).json(
            new apiResponse("status changed successfully",review)
        );

    
    }
);

const changeRole= tryCatch(
    async(req,res)=>{

        const { email , role } = req.body;

        if( [email, role].some(
            (value)=> value===undefined || value.trim()==="")
        ){
            apiError(400,"all fields required")
        };

        const user = await User.findOneAndUpdate(
            {
                email: email
            },{
                $set: {
                    role: role
                }
            }
        )

        if( !user ) apiError(400,"failed to change role");

        res.status(200).json(
            new apiResponse(` ${email} role changed to ${role}`)
        )

    }
)

export {
    getCourses,
    courseDetail,
    reviewing,
    changeRole
}