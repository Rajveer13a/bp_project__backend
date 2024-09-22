import { Router } from "express";
import { createInstructor, getInstructorDetails, updateInstructorDetails } from "../controllers/instructor.controller.js";
import { authorizedroles, isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/create',isLoggedIn(),createInstructor);

router.get('/instructorDetails',isLoggedIn(),getInstructorDetails);

router.patch('/details',isLoggedIn(),authorizedroles("INSTRUCTOR"),updateInstructorDetails);

export default router