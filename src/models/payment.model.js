import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema({
    order_id: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    course_ids: [
        {type: mongoose.Schema.ObjectId,
        required: true}
    ],
    paid: {
        type: Boolean,
        required: true
    },
    payment_id: {
        type: String
    },
    signature: {
        type: String
    },
    instructors: [
        {
            _id: {
                type: mongoose.Schema.ObjectId,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ]


});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;