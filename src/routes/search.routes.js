import { Router } from "express";
import { getSearchSuggestions, searchCourses } from "../controllers/search.controller.js";


const router = Router();

router.get("/", searchCourses);

router.get("/term-suggestions", getSearchSuggestions);




export default router;