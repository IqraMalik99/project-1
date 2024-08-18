import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model"
import { ApiError } from "../utils/ApiError"
import { Responce } from "../utils/Responce"

const toggleVideoLike = AsyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!req.user) {
        throw new ApiError(404, "Unauthorized acess")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "wrong video Id")
    }
    let toogle = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })
    let document;
    if (!toogle) {
        document = await Like.create({
            likedBy: req.user._id,
            video: videoId
        })
    } else {
        document = await Like.findByIdAndDelete(toogle._id);
    }
    if (!document) throw new ApiError(404, "not unlike on video");
    return res.status(200).json(new Responce(200, document, "sucessfully toogle video"))
})

const toggleCommentLike = AsyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!req.user) {
        throw new ApiError(404, "Unauthorized acess")
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "wrong commentId")
    }
    let toogle = await Like.find({
        comment: commentId,
        likedBy: req.user._id
    })
    let document;
    if (!toogle) {
        document = await Like.create({
            likedBy: req.user._id,
            comment: commentId
        })
    } else {
        document = await Like.findByIdAndDelete(toogle._id);
    }
    if (!document) throw new ApiError(404, "not unlike on comment");
    return res.status(200).json(new Responce(200, document, "sucessfully toogle comment"))
})

const toggleTweetLike = AsyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!req.user) {
        throw new ApiError(404, "Unauthorized acess")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "wrong tweetId")
    }
    let toogle = await Like.find({
        tweet: tweetId,
        likedBy: req.user._id
    })
    let document;
    if (!toogle) {
        document = await Like.create({
            likedBy: req.user._id,
            tweet: tweetId
        })
    } else {
         document = await Like.findByIdAndDelete(toogle._id)
    }
    if (!document) throw new ApiError(404, "not unlike on tweet");
    return res.status(200).json(new Responce(200, document, "sucessfully toogle tweet"))
}
)

const getLikedVideos = AsyncHandler(async (req, res) => {
    //TODO: get all liked videos
    if (!req.user) {
        throw new ApiError(404, "Unauthorized acess")
    }
   let videoList = await Like.aggregate([
        {
            $match: {
                likedBy: mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "likedBy",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            email:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likedBy:{
                    $arrayElemAt:["$likedBy",0]
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoData",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        email:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $arrayElemAt: ["$owner", 0]
                            }
                        }
                    }
                ]
            }
        },

    ])
    if(!videoList){
        throw new ApiError(400,"error in getting liked videos");
    }
    return res.status(200).json(new Responce(200,videoList,"sucessfully fetched liked videos"))
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
