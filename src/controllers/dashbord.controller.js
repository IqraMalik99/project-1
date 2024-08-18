import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError"
import { subscription } from "../models/subscription.model"
import { Video } from "../models/video.model"
import { Responce } from "../utils/Responce"
import { Like } from "../models/like.model"


const getChannelStats = AsyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    let { channelId } = req.params
    if (!req.user?._id) throw new ApiError(404, "Unauthorized request");
    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "invalid channel Id");
    }
    let result = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count: "totalVideos"
        }
    ]);
    const totalLikesResult = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        { $unwind: "$likes" },
        { $group: { _id: null, totalLikes: { $sum: 1 } } }
    ]);
    const totalLikes = totalLikesResult.length > 0 ? totalLikesResult[0].totalLikes : 0;
    if (result.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
    }
    let subs = await subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "people",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }, {
            $unwind: "$subscriber"
        }, {
            $project: {
                subscriber: 1
            }
        }
    ])
    if (subs.length === 0) {
        throw new ApiError(404, "not getting subcribers list")
    }
    let endresult = subs.map((doc) => doc.subscriber)

    let totalviews = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);
    const totalViewsOnVideo = totalviews.length > 0 ? totalviews[0].totalViews : 0;
    return res.status(200).json(new Responce(200, {
        ArrayOfVideosWithCount: result,
        subscriberCount: endresult.length,
        subscriberList: endresult,
        totalLikes,
        totalViewsOnVideo
    }, "sucesssfully get videos"))
})

const getChannelVideos = AsyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    let { channelId } = req.params
    if (!req.user?._id) throw new ApiError(404, "Unauthorized request");
    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "invalid channel Id");
    }
    let result = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }, {
            $addFields: {
                owner: {
                    $arrayElemAt: ["$owner", 0]
                }
            }
        }

    ])
    if (result.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
    }

    // Return the result
    return res.status(200).json(new Responce(200, result, "sucesssfully get videos"))
})

export {
    getChannelStats,
    getChannelVideos
}