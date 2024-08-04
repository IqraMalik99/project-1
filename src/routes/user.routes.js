import { Router } from "express";
import {userController,  login, logout, refershMyTokens } from "../controllers/user.controller.js"
import {upload} from "../middleware/multer.middleware.js"
import { auth } from "../middleware/auth.middleware.js"
const  userRouter = Router();

userRouter.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }, 
    {
        name: "coverImage",
        maxCount: 1
    }
]),userController)
userRouter.route("/login").post(login)
userRouter.route("/logout").post(auth,logout)
userRouter.route("/refresh-token").post(refershMyTokens)
export  {userRouter}
