import { Router } from "express";
import { getCollaborativeRecommendations, getContentBasedRecommendations, getContextualRecommendations, getSearchSuggestions, getTopicBasedRecommendations, searchCourses } from "../controllers/search.controller.js";


const router = Router();

router.get("/", searchCourses);

router.get("/term-suggestions", getSearchSuggestions);

router.get("/CollaborativeRecommendations", getCollaborativeRecommendations);

router.get("/ContentBasedRecommendations", getContentBasedRecommendations);

router.get("/ContextualRecommendations", getContextualRecommendations);

router.get("/TopicBasedRecommendations", getTopicBasedRecommendations);




export default router;