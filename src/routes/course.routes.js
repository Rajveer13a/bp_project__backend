import { Router } from "express";
import { addLecturetitle, addVideoToLecture, addfileTOLecture, approvalStatus, createCourse, createSection, deleteCourse, deleteLecture, deleteSection, getCourseDetail, submitForApproval, updateCourseDetails, updateLectureTitle, updateSecitonTitle } from "../controllers/course.controller.js";
import { authorizedroles, isLoggedIn } from "../middlewares/auth.middleware.js";
import multerfunc from "../middlewares/multer.middleware.js";
import { fileExtn, fileSize, imageExtn, imageSize, videoExtn, videoSize } from "../constants.js";

//-------------------------------

const imageMulter = multerfunc(imageSize, imageExtn);

const videoMulter = multerfunc(videoSize, videoExtn);

const fileMulter = multerfunc(fileSize, fileExtn);

const router = Router();

//-------------------------------------

router.all("/*", isLoggedIn(), authorizedroles("INSTRUCTOR"))

router.post('/', createCourse);

router.post('/section/:course_id', createSection);

router.post('/lecture/:given_course_id/:given_section_id',
    addLecturetitle
);

router.post('/lectureVideo/:lecture_id',
    videoMulter.single("lectureVideo"),
    addVideoToLecture
);

router.post('/lectureFile/:lecture_id',
    fileMulter.single("lectureResource"),
    addfileTOLecture
);


router.route('/lecture/:lecture_id')
    .patch(updateLectureTitle)
    .delete(deleteLecture)


router.route('/section/:section_id')
    .patch(updateSecitonTitle)
    .delete(deleteSection);


router.post('/submit', submitForApproval)

router.get('/approvalStatus', approvalStatus)


router.route('/:course_id')
    .get(getCourseDetail)
    .patch(imageMulter.single('thumbnail'), updateCourseDetails)
    .delete(deleteCourse);
//-------------------------------------



export default router;