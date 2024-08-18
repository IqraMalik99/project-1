import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { auth } from "../middleware/auth.middleware.js"
import { getChannelStats, getChannelVideos } from "../controllers/dashbord.controller.js";
const  dashboardRouter = Router();
dashboardRouter.route("/getstatus/:channelId").get(auth,getChannelStats)
dashboardRouter.route("/getvideos/:channelId").get(auth,getChannelVideos)
export{dashboardRouter}