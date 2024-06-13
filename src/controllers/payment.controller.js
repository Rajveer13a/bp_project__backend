import Course from "../models/course.model.js";
import tryCatch from "../utils/tryCatch.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { razorpay } from "../server.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { Customer } from "../models/Payout/bankAccount.model.js";
import { ourComission } from "../constants.js";
import UserConfig from "../models/user.config.js";

const createOrder = tryCatch(
    async (req, res) => {

        const { course_ids } = req.body;

        if (!course_ids || !Array.isArray(course_ids) || course_ids.length === 0) {
            apiError(400, "course ids not given or invalid");
        };

        if( course_ids.some((value)=>{
            return req.user.purchasedCourses.includes(value)
        })){
            apiError(400, "one of the course is already purchased")
        }

        const courses = await Course.find({
            _id: { $in: course_ids },
            approved: true
        });

        if (courses.length !== course_ids.length) {
            return apiError(400, "invalid or unapproved course ids");
        }

        const orderExist = await Payment.findOne({
            user_id: req.user._id,
            paid : false,
            course_ids: { $all: course_ids },
            $expr: { $eq: [{ $size: "$course_ids" }, course_ids.length] }
        });

        if (orderExist) {
            res.status(200).json(
                new apiResponse(
                    "order id ", {
                    order_id: orderExist.order_id,
                    razorpay_key_id: process.env.RAZORPAY_KEY_ID
                })
            );

            return;
        }



        const toatlamount = courses.reduce(((acc, current) => acc + current.price), 0);
        console.log(toatlamount);

        const options = {
            amount: toatlamount * 100,
            currency: "INR"
        }
        const order = await razorpay.orders.create(options);


        if (!order) apiError(400, "failed to create order");

        const instructorPriceMap = {};

        courses.forEach((value) => {
            const instructorId = value.instructor_id;
            const price = value.price;
            const course_id = value._id 

            if (instructorPriceMap[instructorId]) {
                instructorPriceMap[instructorId].price += price;
                instructorPriceMap[instructorId].courses.push({course_id, price});

            } else {
                instructorPriceMap[instructorId] = { _id: instructorId, price: price, courses: [{course_id, price}] };
            }
        });

        
        const instructors = Object.values(instructorPriceMap);


        const saveOrder = await Payment.create({
            course_ids: course_ids,
            order_id: order.id,
            user_id: req.user._id,
            paid: false,
            instructors: instructors
        });

        res.status(200).json(
            new apiResponse(
                "order created successfully",
                { order_id: order.id, razorpay_key_id: process.env.RAZORPAY_KEY_ID }
            )
        );



    }
)

const verifyPayment = tryCatch(
    async (req, res) => {

        const { payment_id, order_id, signature } = req.body;

        if ([payment_id, order_id, signature].some(
            value => value === undefined || value.trim() === ""
        )) {
            apiError(400, "all fields are required");
        };
        
        const order = await Payment.findOne({
            order_id: order_id,
            user_id: req.user._id,
            paid: false
        });
        

        if (!order) apiError(400, " order does not exist");

        const verify = validatePaymentVerification(
            { order_id, payment_id }, signature, process.env.RAZORPAY_SECRET
        );

        if (!verify) {
            apiError(400, "invalid signature");
        };

        order.paid = true;

        order.signature = signature;

        order.payment_id = payment_id;

        await order.save();
        
        let addMoney;

        for (const value of order.instructors) {
            addMoney = await Customer.findOneAndUpdate(
                {
                    instructor_id: value._id
                },
                {
                    $inc: {
                        revenue: value.price
                    }
                }
            );
            
        }

        if (!addMoney) {
            apiError(400, "failed to add money")
        };

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                purchasedCourses: [...req.user.purchasedCourses, ...order.course_ids]
            }
        );

        if (!user) apiError(400, " falied to add course for user");

        const ids_remove = order.course_ids.map((value)=>{
            return value.toString()
        })
        console.log(ids_remove);
        const userConfig =  await UserConfig.findOneAndUpdate(
            {
                user_id: req.user._id
            },
            {
                $pullAll:{
                    cart: ids_remove
                }
            },
            {
                new: true
            }
        );
        console.log("ashdfg", order.course_ids);
        console.log(userConfig)

        res.status(200).json(
            new apiResponse("course added successfully ")
        )

    }
);

// const mysales = tryCatch(
//     async (req, res) => {

//         const instructor_id = req.instructor._id;

//         const sales = await Payment.aggregate([
//             {
//                 $match: {
//                     "instructors._id": instructor_id
//                 }
//             },
//             {
//                 $project: {
//                     instructors: {
//                         $filter: {
//                             input: "$instructors",
//                             as: "instructor",
//                             cond: { $eq: ["$$instructor._id", instructor_id] }
//                         }
//                     },
                    
//                 }
//             }
//         ]);
        

//         if (!sales) apiError(400, " failed to get sales data");

//         res.status(200).json(
//             new apiResponse("sales", sales)
//         );

//     }
// );

const mysales = tryCatch(
    async (req, res) => {
        const instructor_id = req.instructor._id;

        const sales = await Payment.aggregate([
            {
                $match: {
                    "instructors._id": instructor_id
                }
            },
            {
                $unwind: "$instructors"
            },
            {
                $match: {
                    "instructors._id": instructor_id
                }
            },
            {
                $project: {
                    paid: 1,
                    course: "$instructors.courses"
                }
            },
            {
                $unwind: "$course"
            },
            {
                $project: {
                    paid: 1,
                    course_id: "$course.id",
                    course_price: "$course.price"
                }
            }
        ]);

        if (!sales) apiError(400, "Failed to get sales data");

        res.status(200).json(
            new apiResponse("sales", sales)
        );
    }
);



const allSales = tryCatch(
    async (req, res) => {

        const data = await Payment.find({});

        res.status(200).json(
            new apiResponse("sales data fetched successfullly", data)
        );

    }
);

export {
    createOrder,
    verifyPayment,
    mysales,
    allSales
}