import { Router } from "express";
import { authorizedroles, isLoggedIn } from "../middlewares/auth.middleware.js";
import { changeRole, courseDetail, getCourses, reviewing, reviewLecture} from "../controllers/management.controller.js";

const router = Router();

router.all("/*",isLoggedIn());

router.get("/coursesForReview/", authorizedroles('MODE',"ADMIN"), getCourses);

router.get("/courseDetail/",authorizedroles('MODE',"ADMIN"), courseDetail);

router.post("/review",authorizedroles('MODE',"ADMIN"),reviewing);

router.post("/review/lecture", authorizedroles('MODE',"ADMIN"), reviewLecture);

//admin specific routes

router.patch("/changeRoles",authorizedroles("ADMIN"),changeRole);





export default router;