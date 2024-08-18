import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { auth } from "../middleware/auth.middleware.js"
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controllers.js";
const  commentRouter = Router();
commentRouter.route("/getOnVideo/:videoId").get(auth,getVideoComments)
commentRouter.route("/add/:videoId").post(auth,addComment)
commentRouter.route("/update/:commentId").patch(auth,updateComment)
commentRouter.route("/delete/:commentId").delete(auth,deleteComment)

export{commentRouter}