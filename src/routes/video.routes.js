import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { 
    publishAVideo,
    getVideoById,
    getAllVideos,
    togglePublishStatus,
    deleteVideo,
    updateVideo 
} from "../controllers/video.contollers.js";

const videoRoute = Router();

// Publishing a new video
videoRoute.route("/publish").post(
    auth,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
);

// Getting all videos
videoRoute.route("/getAllVideos").get(auth, getAllVideos);

// Getting a video by ID
videoRoute.route("/getVideoById/:videoId").get(auth, getVideoById);

// Updating a video
videoRoute.route("/updateVideo/:videoId").patch(
    auth,
    upload.single("thumbnail"),
    updateVideo
);

// Deleting a video
videoRoute.route("/deleteVideo/:videoId").delete(auth, deleteVideo);

// Toggling publish status of a video
videoRoute.route("/tooglePublished/:videoId").patch(auth, togglePublishStatus);

export { videoRoute };