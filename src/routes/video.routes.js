import { Router } from "express"
import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { publishAVideo } from "../controllers/video.contollers.js";
const videoRoute = Router();

videoRoute.route("/publish").post(auth,
    upload.fields(
        [
            {
                name: "videoFile",
                maxCount: 1
            }, {
                name: "thumbnail",
                maxCount: 1
            }
        ]
    ), publishAVideo)


export { videoRoute }