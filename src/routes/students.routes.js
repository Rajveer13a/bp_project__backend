import { Router } from "express";
import { approvedCourses, courseById, createProgressConfig, learnLecture, learning, markLecture, rateCourse } from "../controllers/student.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();



router.get("/courses",approvedCourses);

// router.all("/*",isLoggedIn());

router.get("/courseDetail",courseById);

router.get("/mylearning", isLoggedIn(), learning);

router.get("/learnLecture", isLoggedIn(), learnLecture);

router.post("/rateCourse", isLoggedIn(), rateCourse);

router.post("/createProgressConfig", isLoggedIn(), createProgressConfig);

router.post("/markLecture", isLoggedIn(), markLecture);

export default router;