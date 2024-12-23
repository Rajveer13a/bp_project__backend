import Course from "../models/course.model.js";
import Payment from "../models/payment.model.js";
import Rating from "../models/Rating.model.js";
import StudentProgress from "../models/studentProgress.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import tryCatch from "../utils/tryCatch.js";
import mongoose from "mongoose";
import { logInteraction } from "./search.controller.js";

const approvedCourses = tryCatch(
    async (req, res) => {

        // const courses = await Course.find(
        //     {
        //         approved: true
        //     }
        // )

        const courses = await Course.aggregate([
            {
                $match: {
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
            }
        ]);

        if (!courses) apiError(400, "failed to fetch courses");




        res.status(200).json(
            new apiResponse("courses fetched succesfully", courses)
        )
    }
);


const courseById = tryCatch(
    async (req, res, next) => {

        const { course_id, user_id } = req.query;


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

                                image: "$user.profileImage.secure_url",
                                bio: 1,
                                username: "$user.username",


                                // image: "$user?.profileImage"
                                // user : {
                                //     profileImage : 1
                                // }

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
                                            // resource: false
                                        }
                                    },
                                    {
                                        $addFields: {
                                            resource: { $cond: { if: { $eq: [resourceFlag, false] }, then: "$$REMOVE", else: "$resource" } },
                                            duration: "$resource.duration"
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
        
        await logInteraction({user_id, course_id, action:"viewed", trackingId:req.cookies.trackingId, tags:course[0].tags , category:course[0].category},res,next);

        res.status(200).json(
            new apiResponse("course fetched successfully", course[0])
        );



    }
);


const learning = tryCatch(
    async (req, res) => {

        const courseList = req.user.purchasedCourses.map((value) => new mongoose.Types.ObjectId(value));

        const courses = await Course.aggregate([
            {
                $match: {
                    _id: { $in: courseList }
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
            }
        ]);

        if (!courses) apiError("failed to get courses");

        res.status(200).json(
            new apiResponse("your course list fetched successfully", courses)
        )

    }
);

const learnLecture = tryCatch(
    async (req, res) => {

        const { course_id } = req.query;

        const userCourses = req.user.purchasedCourses;

        if (!course_id || course_id?.trim() === "") {
            apiError(400, " course id not given");
        };

        if (!userCourses.includes(course_id)) {
            apiError(400, "course not purchased");
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

                                image: "$user.profileImage.secure_url",
                                bio: 1,
                                username: "$user.username",


                                // image: "$user?.profileImage"
                                // user : {
                                //     profileImage : 1
                                // }

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

        const progress = await StudentProgress.findOne({
            course_id,
            user_id: req.user._id
        })

        if (progress) {
            course[0].progress = {
                completed: progress?.completed,
                lastView: progress?.lastView
            }
        }

        const userRating = await Rating.findOne({
            user_id: req.user._id,
            course_id
        })

        if (userRating) {
            course[0].userRating = { comment: userRating.comment, rating: userRating.rating }
        }

        const totalStudents = await Payment.countDocuments({
            paid: true,
            course_ids: { $in: course_id }
        })

        course[0].totalStudents = totalStudents;

        res.status(200).json(
            new apiResponse("course fetched successfully", course[0])
        );



    }
);

const rateCourse = tryCatch(
    async (req, res) => {

        const { course_id, rating, comment } = req.body;

        if ([course_id, rating].some((value) => value === undefined || value?.trim === "")) {
            apiError(400, " all fields are not given ");
        }

        if (!req.user.purchasedCourses.includes(course_id)) {
            apiError(400, "not allowed");
        }

        const exist = await Rating.findOne({
            user_id: req.user._id,
            course_id
        })

        let result;

        if (exist) {

            exist.rating = rating;
            exist.comment = comment;
            result = await exist.save();

        } else {

            result = await Rating.create({
                course_id,
                rating,
                course_id,
                user_id: req.user._id,
                comment
            });

        }


        if (!result) apiError(400, " failed to submit rating");

        res.status(200).json(
            new apiResponse("Rating submitted succesfully", result)
        )
    }
)

const createProgressConfig = tryCatch(
    async (req, res) => {

        const { course_id, schema } = req.body;

        if ([course_id, schema].some((value) => value === undefined || value?.trim === "")) {
            apiError(400, " all fields are not given ");
        }

        const isArrayOfNumbers = Array.isArray(schema) && schema.every(item => typeof item === 'number');

        if (!isArrayOfNumbers) apiError(400, "unexpected data");

        if (!req.user.purchasedCourses.includes(course_id)) {
            apiError(400, "not allowed");
        }

        const completed = schema.map((lec) => new Array(lec).fill(false));

        let progress = await StudentProgress.findOne({
            course_id,
            user_id: req.user._id
        })

        if (progress) {
            apiError(400, "config already exist")
        }

        progress = await StudentProgress.create({
            course_id,
            user_id: req.user._id,
            completed
        })

        res.status(200).json(
            new apiResponse("created successfully", progress)
        )

    }
)

const markLecture = tryCatch(
    async (req, res) => {

        const { course_id, flag, location } = req.body;

        if ([course_id, flag, location].some((value) => value === undefined || value?.trim === "")) {
            apiError(400, " all fields are not given ");
        }

        if (!req.user.purchasedCourses.includes(course_id)) {
            apiError(400, "not allowed");
        }

        let progress = await StudentProgress.findOneAndUpdate(
            {
                course_id,
                user_id: req.user._id
            }, {
            $set: {
                [`completed.${location[0]}.${location[1]}`]: flag
            }
        },
            {
                new: true
            }
        )

        if (!progress) {
            apiError(400, "failed to update")
        }

        res.status(200).json(
            new apiResponse("updated successfully", progress)
        )

    }
)

const lastViewed = tryCatch(
    async (req, res) => {

        const { section_no, lecture_no, course_id } = req.body;

        if ([section_no, lecture_no, course_id].some((value) => value === undefined || value?.trim === "")) {

            apiError(400, "all fields are required");
        }

        if (!req.user.purchasedCourses.includes(course_id)) {
            apiError(400, "not allowed");
        }

        const result = await StudentProgress.updateOne({
            course_id,
            user_id: req?.user?._id
        }, { $set: { lastView: { section_no, lecture_no } } });

        if (!result) apiError(400, "something went wrong");

        res.status(200).json(
            new apiResponse("last viewed successfully")
        )

    }
)

const deleteRating = tryCatch(
    async (req, res) => {

        const { course_id } = req.params;

        if ([course_id].some((value) => value === undefined || value?.trim === "")) {
            apiError(400, " all fields are not given ");
        }

        if (!req.user.purchasedCourses.includes(course_id)) {
            apiError(400, "not allowed");
        }

        const exist = await Rating.findOneAndDelete({
            user_id: req.user._id,
            course_id
        })

        if (!exist) apiError(400, "rating does not exist");

        res.status(200).json(
            new apiResponse("Rating deleted succesfully")
        )
    }
)

const getRatings = tryCatch(
    async (req, res) => {
        const { course_id } = req.params;

        if (!course_id || course_id.trim === "") apiError(400, "course id not given");

        // const ratings = await Rating.find({
        //     course_id
        // });

        const ratings = await Rating.aggregate([
            {
                $match: {
                    course_id: new mongoose.Types.ObjectId(course_id),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    profileImage: "$user.profileImage",
                    username: "$user.username",
                    updatedAt: 1,
                    rating: 1,
                    comment: 1,
                },
            },
        ]);
        

        if (!ratings) apiError(400, "no rating for this course exists");

        res.status(200).json(
            new apiResponse("succesfully feteched all ratings for the course", ratings)
        )
    }

)

export {
    approvedCourses,
    courseById,
    learning,
    learnLecture,
    rateCourse,
    createProgressConfig,
    markLecture,
    lastViewed,
    deleteRating,
    getRatings

};