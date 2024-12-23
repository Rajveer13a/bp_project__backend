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

const interactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    course_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        default: 1
    },
    action: {
        type: String,
        required: true
    },
    trackingId: {
        type: String,
        default: null
    },
    lastIntrectionAt: {
        type: Date,
        default: Date.now
    }
});

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);

export const Interaction = mongoose.model("Interaction", interactionSchema);

export default SearchHistory;
