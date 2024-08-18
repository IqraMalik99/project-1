import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { auth } from "../middleware/auth.middleware.js"
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
const  likesRouter = Router();
likesRouter.route("/toogleVideo/:videoId").patch(auth,toggleVideoLike)
likesRouter.route("/toogleComment/:commentId").patch(auth,toggleCommentLike)
likesRouter.route("/toogleTweet/:tweetId").patch(auth,toggleTweetLike)
likesRouter.route("/getvideo").get(auth,getLikedVideos)

export{likesRouter}