import { mintranferAmount, ourComission, payrollDate } from "../constants.js";
import { Account, Customer } from "../models/Payout/bankAccount.model.js";
import { razorpay } from "../server.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import tryCatch from "../utils/tryCatch.js";


async function creatCustomer(instructor_id, email) {
    let customer = await Customer.findOne({
        instructor_id
    })

    if (!customer) {

        const { id } = await razorpay.customers.create({
            email,
            fail_existing: "0"
        });

        customer = await Customer.create({
            instructor_id,
            customer_id: id,
            revenue: 0
        })

    };

    return customer

}


const addBankAccount = tryCatch(
    async (req, res) => {

        const { name, account_number, ifsc } = req.body;

        if ([name, account_number, ifsc].some(
            value => value === undefined || value.trim() == ""
        )) {
            apiError(400, "all fields are required");
        };

        const customer = await creatCustomer(req.instructor._id, req.user.email);

        // creating fund account for the customer
        const count_account = await Account.countDocuments({
            customer_id: customer.id
        });

        if (count_account >= 2) apiError(400, "cannot add more than 2 accounts")

        const fund = await razorpay.fundAccount.create({
            customer_id: customer.customer_id,
            account_type: "bank_account",
            "bank_account": { name, account_number, ifsc }
        });

        if (!fund) {
            apiError(400, "failed to add bank account");
        };

        const account = await Account.create({
            customer_id: customer.customer_id,
            account_id: fund.id,
            bank_account: fund.bank_account
        });

        if (!account) apiError(400, "failed to add account");

        res.status(200).json(
            new apiResponse("bank account added succesfully", fund.bank_account)
        );

    }
);


// ---------------------------
// automated Payrolls functionality


async function payrolls() {
    
    try {

        const customers = await Customer.find({});

        console.log("----------Payrolls Executing----------");

        for (const customer of customers) {

            if (customer.revenue < mintranferAmount) {
                console.log("skipping");
                continue;
            }
            const account = await Account.findOne({
                customer_id: customer.customer_id
            });

            if (account) {

                const transfer = await razorpay.transfers.create({
                    "account": account.account_id,
                    "amount": (customer.revenue * 1 - ourComission) * 100,
                    "currency": "INR"
                });

                if (transfer) {

                    let result = await Customer.findOneAndUpdate(
                        {
                            customer_id: customer.customer_id
                        },
                        {
                            $dec: {
                                revenue: customer.revenue
                            }
                        }
                    )
                }

            }
        }

        console.log("----------Payrolls completed----------");

    } catch (err) {

        console.log(err,"--------error-payrolls ---------")
    }


}

payrolls();

setInterval(async () => {
    let currentDate = new Date().getDate();

    if (payrollDate.includes(currentDate)) {
        await payrolls()
    }


}, 1000 * 60 * 60 * 24 ); //after every 24 hr payrolls gets checked


export {
    addBankAccount
}