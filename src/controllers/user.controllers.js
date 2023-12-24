import apiResponse from "../utils/apiResponse.js";
import tryCatch from "../utils/tryCatch.js"
import apiError from "../utils/apiError.js"


const registerUser = tryCatch(
    async (req, res) => {

        const { username, email, password, } = req.body;

        
    }
);


export {
    registerUser
}