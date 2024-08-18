import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controllers.js";
const  tweetRouter = Router();
tweetRouter.route("/create").post(auth,createTweet);
tweetRouter.route("/getuser/:userId").post(auth,getUserTweets)
tweetRouter.route("/update/:tweetId").patch(auth,updateTweet);
tweetRouter.route("/delete/:tweetId").delete(auth,deleteTweet);

export{tweetRouter}