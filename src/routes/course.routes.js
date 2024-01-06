import { Router } from "express";
import {addLecturetitle, addVideoToLecture, addfileTOLecture, createCourse, createSection,  updateCourseDetails,  updateLectureTitle, updateSecitonTitle } from "../controllers/course.controller.js";
import { authorizedroles, isLoggedIn } from "../middlewares/auth.middleware.js";
import multerfunc from "../middlewares/multer.middleware.js";
import { fileExtn, fileSize, imageExtn, imageSize, videoExtn, videoSize } from "../constants.js";

//-------------------------------

const imageMulter = multerfunc(imageSize,imageExtn);

const videoMulter = multerfunc(videoSize, videoExtn);

const fileMulter = multerfunc(fileSize, fileExtn);

const router = Router();

router.post('/create',isLoggedIn(),authorizedroles("INSTRUCTOR"),imageMulter.single('thumbnail'),createCourse);

router.post('/create/section/:course_id',isLoggedIn(),authorizedroles("INSTRUCTOR"),createSection);

router.post('/add/lecture/:given_course_id/:given_section_id',
    isLoggedIn(),
    authorizedroles('INSTRUCTOR'),
    addLecturetitle
);

router.post('/add/lectureVideo/:lecture_id',
    isLoggedIn(),
    authorizedroles('INSTRUCTOR'),
    videoMulter.single("lectureVideo"),
    addVideoToLecture
);

router.post('/add/lectureFile/:lecture_id',
    isLoggedIn(),
    authorizedroles('INSTRUCTOR'),
    fileMulter.single("lectureResource"),
    addfileTOLecture
);

router.patch('/update/lecture/:lecture_id',
    isLoggedIn(),
    authorizedroles('INSTRUCTOR'),
    updateLectureTitle
);

router.patch('/update/section/:section_id',
    isLoggedIn(),
    authorizedroles('INSTRUCTOR'),
    updateSecitonTitle
);

router.patch('/update/course/:course_id',
    isLoggedIn(),
    authorizedroles('INSTRUCTOR'),
    imageMulter.single('thumbnail'),
    updateCourseDetails
);

//-------------------------------------

export default router;