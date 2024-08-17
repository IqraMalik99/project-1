import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js"
import { AsyncHandler } from "../utils/AsyncHandlers.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadCloud } from "../utils/cloudnary.js";
import { User } from "../models/user.model.js";
import { Responce } from "../utils/Responce.js";
import { upload } from "../middleware/multer.middleware.js";

let getAllVideos = AsyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    page=parseInt(page,10);  // identifies which base system 
    limit=parseInt(limit,10)
    // default values to avoid errors
    query=query||"";
    sortBy=sortBy||"createdAt";
    sortType=sortType||"desc"
    let videos = await Video.aggregate([
        {
            $match: {
                "owner": new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $match: {
                $or: [
                    { "title": { $regex: query, $options: "i" } },
                    { "description": { $regex: query, $options: "i" } }
                ]
            }
        },
        {
            $sort:{
                [sortBy]: sortType === 'desc' ? -1 : 1
            }
        },
        {
            $skip: (page - 1)*limit
        },
        {
            $limit: limit
        }
    ])
return res.status(200).json(
    new Responce(200,videos,"Sucessfully get all videos")
)
})

let publishAVideo = AsyncHandler(async (req, res) => {
    let { title, description } = req.body;
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are requiredd");
    }
    let videoFileName = req.files?.videoFile[0].path;
    let thumbnailpath = req.files?.thumbnail[0].path;
    if (!videoFileName) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailpath) {
        throw new ApiError(400, " ThumbNail is required");
    }
    let cloudVideoFile = await uploadCloud(videoFileName);        
    let cloudThumbNail = await uploadCloud(thumbnailpath);
    if (!cloudThumbNail) {
        throw new ApiError(400, "not having url of cloudnairy thumbnail")
    }
    if (!cloudVideoFile) {
        throw new ApiError(400, "not having cloud url of videoFile")
    }
    let createVideo = await  Video.create({
        videoFile: cloudVideoFile.url,
        thumbnail: cloudThumbNail.url,
        title: title,
        description: description,
        owner: req.user?._id,
        duration: cloudVideoFile.duration,
        views: 1
    })
    if (!createVideo) {
        throw new ApiError(400, "cannot publish");
    }
 return   res.status(200).json(
        new Responce(200, createVideo, "Sucessfully published a video")
    )
})
let getVideoById = AsyncHandler(async (req, res) => {
    let { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"not having correct id in get video by id")
    }
    let video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"having error in getting video by id")
    }
  return  res.status(200).json(new Responce(200,video,"sucessfully get video by id"));
})

// apply multer middleware with sing field
let updateVideo = AsyncHandler(async (req, res) => {
    let { videoId } = req.params;
    let{title,description}=req.body;
    if(!(title && description)){
        throw new ApiError(400,"not having details for update")
    }
    let thumbnailpath =req.file?.path;
    //TODO: update video details like title, description, thumbnail
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"not having correct id in update video")
    }
   let video = await Video.findById(videoId);
   if(!video){
    throw new ApiError(400,"not getting video by id for update");
   }
   let thumbnailurl = await uploadCloud(thumbnailpath);
   video.thumbnail=thumbnailurl.url
   video.title=title;
   video.description=description;
   await video.save();
   return res.status(200).json(new Responce(200,video,"sucesssfully update video"));
});
const deleteVideo = AsyncHandler(async (req, res) => {
    let { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"not having correct video id for deleting");
    }
    let video = await Video.findByIdAndDelete(videoId); 
    if(!video){
        throw new ApiError(400,"error deleted a video")
    }
    return res.status(200).json(new ApiError(200,video,"Sucessfully deleted  a video"));
});
const togglePublishStatus = AsyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"not having correct video id for toogleing");
    }
    let video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"not having video with id in toogle");
    };

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new Responce(200,video,"sucessfully toogle publised"))
})
export {
    publishAVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

