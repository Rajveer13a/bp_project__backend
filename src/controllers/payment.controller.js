import Course from "../models/course.model.js";
import tryCatch from "../utils/tryCatch.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { razorpay } from "../server.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";

const createOrder = tryCatch(
    async(req, res)=>{

        const { course_id } = req.body;

        if( !course_id || course_id.trim()===""){
            apiError(400, "course id not given ")
        };

        const orderExist = await Payment.findOne({
            user_id: req.user._id,
            course_id: course_id,
        })

        if(orderExist){
            res.status(200).json(
                new apiResponse(
                    "order id ", {
                        order_id: orderExist.order_id,
                        razorpay_key_id: process.env.RAZORPAY_KEY_ID
                    })
            );
            
            return;
        }

        const course = await Course.findOne(
            {
                _id : course_id,
                approved: true
            }
        )

        if( !course ) apiError(400, "invalid course id");

        const amount = course.price;

        const options = {
            amount: amount *100,
            currency: "INR"
        }
        const order = await razorpay.orders.create( options );


        if(!order) apiError(400,"failed to create order");

        const saveOrder = await Payment.create({
            course_id: course._id,
            order_id: order.id,
            user_id: req.user._id,
            paid: false
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
    async (req,res)=>{

        const { payment_id, order_id, signature} = req.body;
        
        if( [payment_id, order_id, signature].some(
            value => value === undefined || value.trim()===""
        ) ){
            apiError(400, "all fields are required");
        };

        const order = await Payment.findOne({
            order_id: order_id,
            user_id: req.user._id,
            paid: false
        });

        if( !order ) apiError(400, " order does not exist");

        const verify = validatePaymentVerification(
            {order_id, payment_id}, signature, process.env.RAZORPAY_SECRET
         );

         if( !verify){
            apiError(400, "invalid signature");
         };

         order.paid = true;

         order.signature = signature;

         order.payment_id = payment_id;

         await order.save();

         const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                purchasedCourses: [...req.user.purchasedCourses, order.course_id]
            }
         );

         if(!user) apiError(400, " falied to add course for user");

         res.status(200).json(
            new apiResponse("course added successfully ")
         )

    }
);


export {
    createOrder,
    verifyPayment
}