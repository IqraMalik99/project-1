import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { Responce } from "../utils/Responce.js"
import { Video } from "../models/video.model.js"


const createPlaylist = AsyncHandler(async (req, res) => {
    const { name, description } = req.body
    //TODO: create playlist
    if (!name || !description || name.trim() === "" || description.trim() === "") {
        throw new ApiError(400, "name and description are required to make playlist")
    }
    if (!req.user) {
        throw new ApiError(400, "Unauthorized acess to create playlist")
    }
    let list = await Playlist.create({
        owner: req.user?._id,
        name,
        description
    });
    if (!list) {
        throw new ApiError(400, "cannot make playlist");
    }
    return res.status(200).json(new Responce(200, list, "created playlist"))
})
// my output will be array of playlist document with each videoData has data of one document
const getUserPlaylists = AsyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Incorrect user Id to get playlist")
    }
    let user = await Playlist.findById(userId);
    if (!user) {
        throw new ApiError(400, "Not having  playlist")
    }
    let gettingList = await Playlist.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
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
                            avatar: 1,
                            email: 1
                        }
                    }
                ]
            },
        },
        {
            $addFields: {
                owner: {
                    $arrayElemAt: ["$owner", 0]
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
                ]
            }
        },
        {
            $unwind: "$videoData"
        }
    ])
    if (!gettingList) {
        throw new ApiError(404, "not getting list by Id")
    }
    return res.status(200).json(200, gettingList, "sucessfully fetched list")
})

const getPlaylistById = AsyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "not having playlist Id")
    }
    let gettingList = await Playlist.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(playlistId)
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
                            avatar: 1,
                            email: 1
                        }
                    }
                ]
            },
        },
        {
            $addFields: {
                owner: {
                    $arrayElemAt: ["$owner", 0]
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
                ]
            }
        },
        {
            $unwind: "$videoData"
        }
    ]) // it return array of document with each videodata contain  1 video data due to unwind but without 
    //unwind it return 1 document with array of videsdata in videodata fiels
    if (!gettingList) {
        throw new ApiError(404, "not getting list by Id")
    }
    return res.status(200).json(200, gettingList, "sucessfully fetched list")
})


const addVideoToPlaylist = AsyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!(isValidObjectId(playlistId)) || !(isValidObjectId(videoId))) {
        throw new ApiError(404, "wrong video and playlist Id for fetching");
    }
    let playlist =await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Not getting playlist to add video");
    }
    let video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "video not found");
    playlist.video.push(videoId);
    await playlist.save()
    return res.status(200).json(200, playlist, "Sucessfully add video on playlist");
})

const removeVideoFromPlaylist = AsyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!(isValidObjectId(playlistId)) || !(isValidObjectId(videoId))) {
        throw new ApiError(404, "wrong video and playlist Id deleting");
    }
    let playlist = Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Not getting playlist to delete video");
    }
    let video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "video not found");
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { video: videoId } },
        { new: true } // Return the updated document
    );

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(new Responce(200, updatedPlaylist, "Successfully removed video from playlist"));

})

const deletePlaylist = AsyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!(isValidObjectId(playlistId))) {
        throw new ApiError(404, "wrong playlist Id for deleting");
    }
    let playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Not getting playlist ");
    }
    return res.status(200).json(200, playlist, "Sucessfully delete");
})

const updatePlaylist = AsyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!(isValidObjectId(playlistId))) {
        throw new ApiError(404, "wrong playlist Id ");
    }
    if (!name || !description) {
        throw new ApiError(404, " required all fields");
    }
    let playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $set: {
            name,
            description
        }
    },
        {
            new: true
        });
    if (!playlist) {
        throw new ApiError(404, "Not getting playlist ");
    }
    return res.status(200).json(200, playlist, "Sucessfully updating")
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

//$push Operator: Adds elements to an array field.
// $each Modifier: Allows adding multiple elements to an array in one operation.
// $addToSet Operator: Adds elements to an array only if they do not already exist, ensuring uniqueness.