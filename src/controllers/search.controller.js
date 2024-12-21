import Course from "../models/course.model.js";
import tryCatch from "../utils/tryCatch.js";
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import SearchHistory from "../models/search.model.js";

const searchCourses = tryCatch(
    async (req, res, next) => {

        const { searchTerm, category, level, priceMin, priceMax, language, sortBy, sortOrder, page = 1, limit = 10, user_id} = req.query;

        // if (!searchTerm) apiError(400, "searchTerm not given");

        const { trackingId } = req.cookies;

        const filters = {
            category, level, language, approved:true
        };

        if (searchTerm) {
            filters.$text = { $search: searchTerm };
        }

        for (let key in filters) {
            if (!filters[key]) delete filters[key];
        }

        if (priceMin || priceMax) {
            filters.price = {};
            if (priceMin) filters.price.$gte = Number(priceMin);
            if (priceMax) filters.price.$lte = Number(priceMax);
        }

        const skip = (page - 1) * limit;

        let sortCriteria = {};

        if (sortBy === 'price') {
            sortCriteria.price = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'rating') {
            sortCriteria.averageRating = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'date') {
            sortCriteria.createdAt = sortOrder === 'desc' ? -1 : 1;
        }

        const pipeline = [
            {
                $match: filters,
            },
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",
                    foreignField: "course_id",
                    as: "ratings",
                },
            },
            {
                $addFields: {
                    averageRating: { $avg: "$ratings.rating" },
                    totalRatings: { $size: "$ratings" },
                },
            },
            {
                $project: {
                    ratings: 0,
                },
            },
            {
                $lookup: {
                    from: "instructors", // Lookup the Instructor collection
                    localField: "instructor_id",
                    foreignField: "_id",
                    as: "instructorDetails",
                },
            },
            {
                $unwind: {
                    path: "$instructorDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "instructorDetails.user_id",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    title: 1,
                    category: 1,
                    level: 1,
                    language: 1,
                    price: 1,
                    averageRating: 1,
                    description: 1,
                    totalRatings: 1,
                    thumbnail: 1,
                    subtitle: 1,
                    instructor: "$userDetails.username",
                },
            },
            { $skip: skip },
            { $limit: limit },
        ];

        if (Object.keys(sortCriteria).length > 0) {
            pipeline.push({ $sort: sortCriteria });
        }

        const courses = await Course.aggregate(pipeline);

        if (!courses) apiError(400, "Failed to get courses");

        await logSearchTerm({ user_id, searchTerm, trackingId }, "_", next);

        res.status(200).json(
            new apiResponse("success", {courses, searchTerm: searchTerm || ""})
        );
    }
);

const logSearchTerm = tryCatch(
    async ({ searchTerm, user_id = null, trackingId = null, }, _, next) => {

        const filter = user_id
            ? { searchTerm, user_id }
            : { searchTerm, trackingId };

        const update = {
            $set: { lastSearchedAt: new Date() },
            $inc: { count: 1 }
        };

        await SearchHistory.findOneAndUpdate(filter, update, {
            upsert: true,
            new: true
        });

    }
)

const getSearchSuggestions = tryCatch(
    async (req, res) => {

        const { searchTerm, user_id } = req.query;

        const { trackingId }= req.cookies;

        if (!searchTerm) apiError(400, "search term is required")

        let suggestions = [];

        const match = {
            searchTerm: { $regex: `^${searchTerm}`, $options: "i" },
            $or: [
                { user_id },
                { trackingId },
            ],
        };

        const userSuggestions = await SearchHistory.find(match).sort({ count: -1, lastSearched: -1 }).limit(5);

        suggestions = userSuggestions.map((s) => s.searchTerm);

        const globalSuggestions = await SearchHistory.find({
            searchTerm: { $regex: `^${searchTerm}`, $options: "i" },
        })
            .sort({ count: -1, lastSearched: -1 })
            .limit(5);

        const globalTerms = globalSuggestions
            .map((s) => s.searchTerm)
            .filter((term) => !suggestions.includes(term));

        suggestions = [...suggestions, ...globalTerms];

        if (suggestions.length === 0) {
            const courseSuggestions = await Course.find({
                title: { $regex: searchTerm, $options: "i" },
                approved:true
            })
                .select("title")
                .limit(5);

            suggestions = [...courseSuggestions.map((c) => c.title)];
        }

        suggestions = [...new Set(suggestions)];

        res.status(200).json(
            new apiResponse("success", suggestions)
        );
    }
)

const linkSessionToUser = async (user_id, trackingId) => {
    if (!user_id || !trackingId) return;
    
    await SearchHistory.updateMany(
        { trackingId, user_id: null },
        { $set: { user_id } }
    );
};


export {
    searchCourses,
    getSearchSuggestions,
    linkSessionToUser
}