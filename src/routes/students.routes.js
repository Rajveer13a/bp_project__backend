import { Router } from "express";
import { approvedCourses, courseById } from "../controllers/student.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();



router.get("/courses",approvedCourses);

// router.all("/*",isLoggedIn());

router.get("/courseDetail",courseById)

export default router;