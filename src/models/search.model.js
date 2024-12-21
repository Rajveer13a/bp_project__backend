import mongoose from "mongoose";


const searchHistorySchema = new mongoose.Schema({
    searchTerm: {
        type: String,
        required: true,
        index: true
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    trackingId: {
        type: String,
        default: null
    },
    count: {
        type: Number,
        default: 1
    },
    lastSearchedAt: {
        type: Date,
        default: Date.now
    }
});

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);

export default SearchHistory;
