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
app.use("/users", userRouter)
app.use("/video",videoRoute)
export {app}