import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { auth } from "../middleware/auth.middleware.js"
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
const  subscriptionRouter = Router();

subscriptionRouter.route("/toogle/:channelId").patch(auth,toggleSubscription)
subscriptionRouter.route("/subscriber/:channelId").get(auth,getUserChannelSubscribers);
subscriptionRouter.route("/subscribeTo/:subscriberId").get(auth,getSubscribedChannels);


export{subscriptionRouter}