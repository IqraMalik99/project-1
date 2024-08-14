import { Router } from "express";
import {userController,  login, logout, refershMyTokens, updateData, changepassword, changeAvatar, changeCoverImage, watchHistory, userProfile ,currentUser} from "../controllers/user.controller.js"
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
userRouter.route("/refreshToken").post(auth,refershMyTokens);
userRouter.route("/changeProfile").post(auth,updateData);   
userRouter.route("/changePassword").patch(auth,changepassword);
userRouter.route("/changeAvatar").patch(auth,upload.single("avatar"),changeAvatar);            //check pending
userRouter.route("/changeCoverImage").patch(auth,upload.single("coverImage"),changeCoverImage); //check pending
userRouter.route("/currentUser").get(auth,currentUser);
userRouter.route("/watchHistory").get(auth,watchHistory);
userRouter.route("/userProfile/:username").post(auth,userProfile)
export  {userRouter}
