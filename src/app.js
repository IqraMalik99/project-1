import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin :process.env.CORS,
    credentials :true
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended: true, limit :"16kb"}))
app.use(cookieParser())

import { userRouter } from "./routes/user.routes.js"
import {videoRoute} from "./routes/video.routes.js"
import { likesRouter } from "./routes/likes.routes.js";
import { commentRouter } from "./routes/comment.routes.js";
import { tweetRouter } from "./routes/tweet.routes.js";
import { subscriptionRouter } from "./routes/subscription.routes.js";
import { playlistRouter } from "./routes/playlist.routes.js";
import { dashboardRouter } from "./routes/dashboard.route.js";
import { healthcheckRouter } from "./routes/healthcheck.routes.js";

app.use("/users", userRouter)
app.use("/video",videoRoute)
app.use("/likes",likesRouter)
app.use("/comment",commentRouter)
app.use("/tweet",tweetRouter)
app.use("/subs",subscriptionRouter)
app.use("/playlist",playlistRouter)
app.use("/dashboard",dashboardRouter)
app.use("/healthcheck",healthcheckRouter)
export {app}