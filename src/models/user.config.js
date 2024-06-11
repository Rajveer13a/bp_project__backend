
import mongoose, { Schema } from "mongoose";


const userconfigSchema = new Schema({
    user_id : {
        type : Schema.Types.ObjectId,
        required: true
    },

    cart: {
        type: Array,
        
    },
    favourite: {
        type: Array,
        
    }

})

const UserConfig = mongoose.model('UserConfig', userconfigSchema);

export default UserConfig;
