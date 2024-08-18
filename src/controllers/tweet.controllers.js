import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Responce } from "../utils/Responce.js";
import {AsyncHandler}from "../utils/AsyncHandlers.js"
const createTweet = AsyncHandler(async (req, res) => {
    //TODO: create tweet
    let {content} =req.body;
    if(!req.user){
        throw new ApiError(404,"Unaytorized user");
    }
    if(!content|| content.trim()== "" ) throw new ApiError(400,"content is required");
  let msg =  await Tweet.create({
        content,
        owner:req.user?._id
    })
    if(!msg){
        throw new ApiError(400,"Not create tweet")
    }
    return res.status(200).json(new Responce(200,msg,"Scessfully created tweet"));
})

const getUserTweets = AsyncHandler(async (req, res) => {
    let{userId}=req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"invalid userId in Tweet");
    }
    let tweets = await Tweet.find({ owner: userId });
    if(!tweets){
        throw new ApiError(400,"Not having tweets");
    }
    return res.status(200).json(new Responce(200,tweets,"getted user Tweets"));

})

const updateTweet = AsyncHandler(async (req, res) => {
    //TODO: update tweet
    let{tweetId}=req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid userId in Tweet");
    }
    let {content} =req.body;
    if(!req.user){
        throw new ApiError(404,"Unaytorized user");
    }
    if(!content|| content.trim()== "") throw new ApiError(400,"content is required");
    let tweeted= await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )
    if(!tweeted){
        throw new ApiError(400,"Not having tweeted");
    }
    return res.status(200).json(new Responce(200,tweeted,"update  Tweets"));
})

const deleteTweet = AsyncHandler(async (req, res) => {
    //TODO: delete tweet
    let{tweetId}=req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid userId in Tweet");
    }
    if(!req.user){
        throw new ApiError(404,"Unautorized user");
    }
    let tweeted= await Tweet.findByIdAndDelete(tweetId);
    if(!tweeted){
        throw new ApiError(400,"Not having tweeted to delete");
    }
    return res.status(200).json(new Responce(200,tweeted,"delete  Tweets"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}