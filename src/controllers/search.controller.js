import Course from "../models/course.model.js";
import tryCatch from "../utils/tryCatch.js";
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import SearchHistory from "../models/search.model.js";
import { Interaction } from "../models/search.model.js";
import crypto from "crypto";

const searchCourses = tryCatch(
    async (req, res, next) => {
        let { searchTerm, category, level, priceMin, priceMax, language, rating, sortBy, sortOrder, page = 1, user_id } = req.query;

        const limit = 10;

        page = Number(page);

        const { trackingId } = req.cookies;

        const filters = {
            category,
            level,
            language,
            approved: true,
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

        let sortCriteria = {};
        if (sortBy === 'price') {
            sortCriteria.price = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'rating') {
            sortCriteria.averageRating = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'date') {
            sortCriteria.createdAt = 1;
        } else if (sortBy === 'reviewed') {
            sortCriteria.totalRatings = sortOrder === 'desc' ? -1 : 1;
        }

        const skip = (page - 1) * limit;

        const pipeline = [
            {
                $match: filters,
            },
            {
                $lookup: {
                    localField: "_id",
                    foreignField: "course_id",
                    from: "sections",
                    as: "sections",
                    pipeline: [
                        {
                            $lookup: {
                                from: "lectures",
                                localField: "_id",
                                foreignField: "section_id",
                                as: "lectures"
                            }
                        },
                        {
                            $addFields: {
                                sectionTotalDuration: {
                                    $sum: "$lectures.resource.duration"
                                },
                                sectionTotalLectures: {
                                    $size: "$lectures"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    totalLectures: {
                        $sum: "$sections.sectionTotalLectures"
                    },
                    totalDuration: {
                        $sum: "$sections.sectionTotalDuration"
                    }
                }
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
                $match: {
                    ...(rating ? { averageRating: { $gte: Number(rating) } } : {}),
                },
            },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    courses: [
                        ...(Object.keys(sortCriteria).length > 0 ? [{ $sort: sortCriteria }] : []),
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "instructors",
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
                                goals: 1,
                                instructor: "$userDetails.username",
                                totalLectures: 1,
                                totalDuration: 1

                            },
                        },
                    ],
                },
            },
        ];

        const result = await Course.aggregate(pipeline);
        const metadata = result[0].metadata[0] || { total: 0 };
        const courses = result[0].courses;

        if (!courses) apiError(400, "Failed to get courses");

        if (courses.length > 0) await logSearchTerm({ user_id, searchTerm, trackingId }, "_", next);

        res.status(200).json(
            new apiResponse("success", {
                courses,
                total: metadata.total,
                totalPages: Math.ceil(metadata.total / limit),
                currentPage: page,
                searchTerm: searchTerm || "",
                limit
            })
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

export const logInteraction = tryCatch(
    async ({ user_id, course_id, action, trackingId, tags = [], category }, res, next) => {

        if (!course_id || !action || !category || !tags) return;

        if (!trackingId && !user_id) {
            trackingId = crypto.randomBytes(20).toString('hex');
            res.cookie("trackingId", trackingId, {
                httpOnly: false,
                secure: true,
                sameSite: 'None',
                age: 365 * 24 * 60 * 60 * 1000, // Cookie expires in 365 days
            });
        }

        const filter = user_id ? { user_id, course_id } : { trackingId, course_id };

        const update = {
            $set: { lastIntrectionAt: new Date() },
            $inc: { count: 1 },
            $setOnInsert: { category, tags, action }
        };

        await Interaction.findOneAndUpdate(filter, update, {
            upsert: true,
            new: true
        });

    }
)

const getSearchSuggestions = tryCatch(
    async (req, res) => {

        const { searchTerm, user_id } = req.query;

        const { trackingId } = req.cookies;

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
                approved: true
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

// recommendation

const getCollaborativeRecommendations = tryCatch(
    async (req, res) => {
        const { user_id } = req.query;
        const trackingId = req.cookies.trackingId;

        // Fetch user interaction history
        const userHistory = await Interaction.find({
            $or: [
                { user_id: user_id },
                { trackingId: trackingId }
            ]
        }).populate('course_id');

        const viewedCourses = userHistory.map(entry => entry.course_id._id);

        if (viewedCourses.length === 0) {
            return res.status(404).json(
                new apiResponse("success", [])
            );
        }

        // Find users who have interacted with the same courses
        const similarUsers = await Interaction.aggregate([
            { $match: { course_id: { $in: viewedCourses } } },
            { $group: { _id: "$user_id" } },
            { $match: { _id: { $ne: user_id } } },
        ]);

        const similarUserIds = similarUsers.map(user => user._id);

        // Find courses that these similar users have interacted with
        const recommendedCourses = await Interaction.find({
            user_id: { $in: similarUserIds },
            course_id: { $nin: viewedCourses }  // Exclude courses already viewed by the user
        }).populate('course_id').limit(10);

        // Get the course details
        const uniqueCourseIds = [...new Set(recommendedCourses.map(entry => entry.course_id._id))];
        // const populatedRecommendations = await Course.find({ _id: { $in: uniqueCourseIds }, approved: true });
        const populatedRecommendations = await Course.aggregate([
            {
                $match: {
                    _id: { $in: uniqueCourseIds },
                    approved: true
                },
            },
            {
                $lookup: {
                    localField: "_id",
                    foreignField: "course_id",
                    from: "sections",
                    as: "sections",
                    pipeline: [
                        {
                            $lookup: {
                                from: "lectures",
                                localField: "_id",
                                foreignField: "section_id",
                                as: "lectures"
                            }
                        },
                        {
                            $addFields: {
                                sectionTotalDuration: {
                                    $sum: "$lectures.resource.duration"
                                },
                                sectionTotalLectures: {
                                    $size: "$lectures"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    totalLectures: {
                        $sum: "$sections.sectionTotalLectures"
                    },
                    totalDuration: {
                        $sum: "$sections.sectionTotalDuration"
                    }
                }
            },
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",
                    foreignField: "course_id",
                    as: "ratings"
                }
            },
            {
                $addFields: {
                    averageRating: {
                        $avg: "$ratings.rating"
                    },
                    totalRatings: {
                        $size: "$ratings"
                    }
                }
            },
            {
                $project: {
                    sections: 0,
                    lectures: 0,
                    ratings: 0
                }
            },
            {
                $limit: 10
            }
        ])

        res.status(200).json(
            new apiResponse("success", populatedRecommendations)
        );
    }
);

const getContentBasedRecommendations = tryCatch(
    async (req, res) => {
        const { user_id } = req.query;
        const trackingId = req.cookies.trackingId;

        // Fetch user interaction history without populating
        const userInteraction = await Interaction.find({
            $or: [
                { user_id: user_id },
                { trackingId: trackingId }
            ]
        });

        const viewedCourses = userInteraction.map(entry => entry);

        if (viewedCourses.length === 0) {
            return res.status(404).json(
                new apiResponse("success", [])
            );
        }

        const tags = [...new Set(viewedCourses.flatMap(course => course.tags))];

        // Find recommended courses based on similar tags
        const recommendedCourses = await Course.find({
            tags: { $in: tags },
            // _id: { $nin: viewedCourses },
            approved: true
        }).limit(10);

        res.status(200).json(
            new apiResponse("success", recommendedCourses)
        );
    }
);

const getContextualRecommendations = tryCatch(
    async (req, res) => {
        const { user_id } = req.query;
        const trackingId = req.cookies.trackingId;

        // Find the most recent search term
        const recentSearch = await SearchHistory.findOne({
            $or: [
                { user_id: user_id },
                { trackingId: trackingId }
            ]
        }).sort({ lastSearchedAt: -1 });

        if (!recentSearch) {
            return res.status(404).json(
                new apiResponse("success", [])
            );
        }

        // Find recommended courses based on the most recent search term
        const recommendedCourses = await Course.find({
            $or: [
                { title: { $regex: recentSearch.searchTerm, $options: "i" } },
                { tags: { $in: [recentSearch.searchTerm] } }
            ],
            approved: true
        }).limit(10);

        res.status(200).json(
            new apiResponse("success", recommendedCourses)
        );
    }
);

const getTopicBasedRecommendations = tryCatch(
    async (req, res) => {
        const { user_id } = req.query;
        const trackingId = req.cookies.trackingId;

        const coreTopics = {
            "Web Development": ["web", "web development", "frontend", "backend", "javascript", "react", "node", "html", "css", "vue", "angular", "typescript", "sass", "bootstrap", "webpack", "gulp", "npm", "babel", "redux", "express", "next.js", "nuxt.js", "graphql", "api", "rest", "sql", "nosql", "mongodb", "postgresql", "php", "laravel", "django", "ruby on rails", "flask", "spring", "asp.net", "jquery", "ajax", "json", "xml", "git", "github", "bitbucket", "ci/cd", "docker", "kubernetes", "cloud", "aws", "azure"],
            "Ethical Hacking": ["cybersecurity", "hacking", "security", "penetration testing", "ethical hacking", "network security", "information security", "vulnerability assessment", "incident response", "malware analysis", "forensics", "exploit development", "reverse engineering", "social engineering", "phishing", "cyber threat intelligence", "risk management", "compliance", "security operations", "firewalls", "intrusion detection", "intrusion prevention", "siem", "ids", "ips", "encryption", "cryptography", "ssl", "tls", "vpn", "wireshark", "metasploit", "burp suite", "nmap", "owasp", "web application security", "mobile security", "cloud security", "endpoint security", "zero trust", "zero day", "ctf", "bug bounty", "red teaming", "blue teaming", "threat hunting"],
            "Data Science": ["data science", "machine learning", "deep learning", "data analysis", "statistics", "data visualization", "python", "r", "sql", "pandas", "numpy", "scikit-learn", "tensorflow", "keras", "pytorch", "matplotlib", "seaborn", "plotly", "power bi", "tableau", "big data", "hadoop", "spark", "etl", "data warehousing", "data mining", "time series", "nlp", "natural language processing", "predictive analytics", "business intelligence", "ai", "artificial intelligence", "data engineering", "cloud computing", "aws", "azure", "google cloud", "data governance", "data ethics", "data quality", "data cleaning", "feature engineering", "model deployment", "mle", "machine learning engineering", "data storytelling"],
            "AI and Machine Learning": ["artificial intelligence", "machine learning", "neural networks", "ai", "deep learning", "supervised learning", "unsupervised learning", "reinforcement learning", "computer vision", "natural language processing", "nlp", "robotics", "automation", "tensorflow", "keras", "pytorch", "scikit-learn", "data preprocessing", "data augmentation", "model evaluation", "model selection", "hyperparameter tuning", "gradient descent", "backpropagation", "transfer learning", "generative adversarial networks", "gans", "recurrent neural networks", "rnns", "convolutional neural networks", "cnns", "self-driving cars", "ai ethics", "explainable ai", "ai fairness", "ai safety", "robotic process automation", "rpa", "edge ai", "ai in healthcare", "ai in finance", "ai in marketing", "ai in education", "ai in retail", "ai in manufacturing", "speech recognition", "image recognition", "chatbots", "virtual assistants"],
            "Mobile Development": ["mobile development", "android", "ios", "flutter", "react native", "swift", "kotlin", "java", "dart", "xcode", "android studio", "mobile app design", "mobile ui", "mobile ux", "cross-platform development", "mobile security", "firebase", "mobile testing", "unit testing", "integration testing", "app store optimization", "aso", "push notifications", "in-app purchases", "monetization", "mobile performance", "native development", "phonegap", "cordova", "ionic", "progressive web apps", "pwa", "ar", "vr", "augmented reality", "virtual reality", "mobile analytics", "user engagement", "mobile advertising", "admob", "unity", "unreal engine", "game development", "mobile games", "mobile frameworks", "mobile databases", "sqlite", "realm"]
        };

        if (!user_id && !trackingId) {
            apiError(400, "trackingId is required")
        }

        const userInteraction = await Interaction.find({
            $or: [
                { user_id: user_id },
                { trackingId: trackingId }
            ]
        }).populate('course_id');

        const viewedCourses = userInteraction.map(entry => entry.course_id);

        if (viewedCourses.length === 0) {
            return res.status(404).json(
                new apiResponse("success", [])
            );
        }

        const viewedCourseIds = viewedCourses.map(course => course._id.toString());

        const tagFrequency = {};
        viewedCourses.forEach(course => {
            course.tags.forEach(tag => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
        });


        const topicInterest = {};
        for (const [topic, tags] of Object.entries(coreTopics)) {
            tags.forEach(tag => {
                const regex = new RegExp(`\\b${tag}\\b`, "i");
                for (const tag in tagFrequency) {
                    if (regex.test(tag)) {
                        topicInterest[topic] = (topicInterest[topic] || 0) + tagFrequency[tag];
                    }
                }
            });
        }

        const sortedTopics = Object.keys(topicInterest).sort((a, b) => topicInterest[b] - topicInterest[a]);
        const topTwoTopics = sortedTopics.slice(0, 2);

        const recommendations = await Promise.all(topTwoTopics.map(async topic => {
            const topicTags = coreTopics[topic];
            const regexArray = topicTags.map(tag => new RegExp(`\\b${tag}\\b`, "i"));
            // const courses = await Course.find({
            //     tags: { $in: regexArray },
            //     // _id: { $nin: viewedCourseIds },
            //     approved: true
            // }).limit(10);

            const courses = await Course.aggregate([
                {
                    $match: {
                        tags: { $in: regexArray },
                        approved: true
                    },
                },
                {
                    $lookup: {
                        localField: "_id",
                        foreignField: "course_id",
                        from: "sections",
                        as: "sections",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "lectures",
                                    localField: "_id",
                                    foreignField: "section_id",
                                    as: "lectures"
                                }
                            },
                            {
                                $addFields: {
                                    sectionTotalDuration: {
                                        $sum: "$lectures.resource.duration"
                                    },
                                    sectionTotalLectures: {
                                        $size: "$lectures"
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        totalLectures: {
                            $sum: "$sections.sectionTotalLectures"
                        },
                        totalDuration: {
                            $sum: "$sections.sectionTotalDuration"
                        }
                    }
                },
                {
                    $lookup: {
                        from: "ratings",
                        localField: "_id",
                        foreignField: "course_id",
                        as: "ratings"
                    }
                },
                {
                    $addFields: {
                        averageRating: {
                            $avg: "$ratings.rating"
                        },
                        totalRatings: {
                            $size: "$ratings"
                        }
                    }
                },
                {
                    $project: {
                        sections: 0,
                        lectures: 0,
                        ratings: 0
                    }
                },
                {
                    $limit: 10
                }
            ])

            return {
                topic: topic,
                data: courses
            };
        }));

        res.status(200).json(
            new apiResponse("success", recommendations)
        );
    }
);


export {
    searchCourses,
    getSearchSuggestions,
    linkSessionToUser,
    getCollaborativeRecommendations,
    getContentBasedRecommendations,
    getContextualRecommendations,
    getTopicBasedRecommendations

}