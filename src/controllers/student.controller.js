import Course from "../models/course.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import tryCatch from "../utils/tryCatch.js";
import  mongoose  from "mongoose";

const approvedCourses = tryCatch(
    async(req, res)=>{

        const courses = await Course.find(
            {
                approved:true
            }
        )

        if(!courses) apiError(400,"failed to fetch courses");

        res.status(200).json(
            new apiResponse("courses fetched succesfully",courses)
        )
    }
);


const courseById = tryCatch(
    async (req, res )=>{

        const { course_id } = req.body;

        if( !course_id || course_id?.trim()===""){
            apiError(400, " course id not given");
        };
        
        const course = await Course.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(course_id),
                    approved: true
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
                                            resource: 0,
                                            __v: 0,
                                            approved: 0
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

        if( course.length ===0 ){
            apiError(400, " no course found");
        };

        res.status(200).json(
            new apiResponse("course fetched successfully",course[0])
        );



    }
);

export {
    approvedCourses,
    courseById
};