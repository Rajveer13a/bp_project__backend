import { Router } from "express";
import { createInstructor, getInstructorDetails } from "../controllers/instructor.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/create',isLoggedIn(),createInstructor);

router.get('/instructorDetails',isLoggedIn(),getInstructorDetails);

export default router