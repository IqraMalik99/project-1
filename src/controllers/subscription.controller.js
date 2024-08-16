import mongoose, { isValidObjectId } from "mongoose"
import { subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { Responce } from "../utils/Responce.js"



const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!(isValidObjectId(channelId))) {
        throw new ApiError(400, "not having correct channel id for toogle subscription")
    }
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized user");
    }
    let a = await subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $match: {
                people: req.user?._id
            }
        }
    ])
    let result;
    if (a.length>0) {
        result = await subscription.findByIdAndDelete(a[0].people);
    }
    else {
        result = await subscription.create({
            channel: channelId,
            people: req.user?._id
        })
    }
    if (!result) {
        throw new ApiError(400, " having error in toogle subscription")
    }
    return res.status(200).json(new Responce(200, result, "Sucessfully toogle subscription"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "not having correct channnel in subscribers")
    }
    if (!req.user) {
        throw new ApiError(401, "unauthorized acess to get subscribers")
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
        },{
            $unwind:"$subscriber"
        },{
           $project:{
            subscriber:1
           } 
        }
    ])
    let endresult = subs.map((doc) => doc.subscriber)
    res.status(200).json(new Responce(200, {
        subscriberCount: endresult.length,
        subscriberList: endresult
    }, "Sucessfully getting subscribers"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "wrong subscriberId");
    }
  let subs =  await subscription.aggregate([
        {
            $match: {
                people: mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedTo",
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
        },{
            $unwind:"$subscribedTo"        // use in document field to make seprate doc for every element in an array
        },
        {
            $project:{
                subscribedTo: 1
            }
        }
    ])
   let result = subs.map((doc)=> doc.subscribedTo); 
   res.status(200).json(new Responce(200,{
    subscribedToCount: result.length ,
    subscribedTo:result
   },"Sucessfully get Subscribed To"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}