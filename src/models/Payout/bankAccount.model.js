import { Schema } from "mongoose";
import mongoose from "mongoose";

const customerSchema = Schema({
    customer_id:{
        type: String,
        required: true
    },
    instructor_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    revenue: {
        type: Number,
        required: true
    }
})

const AccountSchema = Schema({
    customer_id: {
        type: String,
        required: true
    },
    account_id:{
        type: String,
        required: true
    },
    bank_account:{
        type: Object,
        required: true
    }

})

const Customer = mongoose.model("Customer",customerSchema);

const Account = mongoose.model("Account",AccountSchema);

export {
    Customer,
    Account
};