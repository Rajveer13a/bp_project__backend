import Course from "../models/course.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import tryCatch from "../utils/tryCatch.js";
import mongoose from "mongoose";

const approvedCourses = tryCatch(
    async (req, res) => {

        // const courses = await Course.find(
        //     {
        //         approved: true
        //     }
        // )

        const courses = await Course.aggregate([
            {
                $lookup: {
                    from: "instructors",
                    localField: "instructor_id",
                    foreignField: "_id",
                    as: "instructor",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "user"
                            }
                        },
                        {
                            $unwind: "$user"
                        },
                        {
                            $project: {
                                username: "$user.username",
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$instructor"
            }
        ]);

        if (!courses) apiError(400, "failed to fetch courses");

        
        

        res.status(200).json(
            new apiResponse("courses fetched succesfully", courses)
        )
    }
);


const courseById = tryCatch(
    async (req, res) => {

        const { course_id } = req.query;
        

        // const userCourses = req.user.purchasedCourses;

        let resourceFlag = false;

        // if (userCourses.includes(course_id)) {
        //     resourceFlag = true;
        // };

        if (!course_id || course_id?.trim() === "") {
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
                    from: "instructors",
                    localField: "instructor_id",
                    foreignField: "_id",
                    as: "instructor",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "user"
                            }
                        },
                        {
                            $unwind: "$user"
                        },
                        {
                            $project: {
                                username: "$user.username",
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$instructor"
            },
            {
                $lookup: {
                    from: "sections",
                    localField: "_id",
                    foreignField: "course_id",
                    as: "sections",
                    pipeline: [
                        {
                            $sort: { createdAt: 1 }
                        },
                        {
                            $lookup: {
                                from: "lectures",
                                localField: "_id",
                                foreignField: "section_id",
                                as: "lectures",
                                pipeline: [
                                    {
                                        $sort: { createdAt: 1 }
                                    },
                                    {
                                        $project: {
                                            createdAt: false,
                                            updatedAt: false,
                                            instructor_id: false,
                                            section_id: false,
                                            __v: false,
                                            approved: false,
                                        }
                                    },
                                    {
                                        $addFields: {
                                            resource: { $cond: { if: { $eq: [resourceFlag, false] }, then: "$$REMOVE", else: "$resource" } }
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


        if (course.length === 0) {
            apiError(400, " no course found");
        };

        res.status(200).json(
            new apiResponse("course fetched successfully", course[0])
        );



    }
);

export {
    approvedCourses,
    courseById
};