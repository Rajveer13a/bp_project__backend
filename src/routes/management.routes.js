import { Router } from "express";
import { authorizedroles, isLoggedIn } from "../middlewares/auth.middleware.js";
import { changeRole, courseDetail, getCourses, reviewing} from "../controllers/management.controller.js";

const router = Router();

router.all("/*",isLoggedIn(),authorizedroles("ADMIN"));

router.get("/coursesForReview", authorizedroles('MODES'), getCourses);

router.get("/courseDetail",authorizedroles('MODES'), courseDetail);

router.post("/review",authorizedroles('MODES'),reviewing);

router.patch("/changeRoles",changeRole);





export default router;