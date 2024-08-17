import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js"
import { Responce } from "../utils/Responce.js";
const getVideoComments = AsyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    if (!(isValidObjectId(videoId))) {
        throw new ApiError(400, "Wrong video Id");
    }
    if (!req.user) {
        throw new ApiError(400, "user is unauthorized to comment");
    }
    let gettingComments = await Comment.aggregate([
        {
            $match: {
                $and: [
                    { "video": mongoose.Types.ObjectId(videoId) },
                    { "owner": req.user?._id }
                ]
            }
        }, 
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        }
    ])
    if (!gettingComments) {
        throw new ApiError(400, "not getting comment");
    }
    let arrayofcomments = gettingComments.map((comment) => comment.content);
    return res.status(200).json(200,arrayofcomments,"Sucessfully getting comments")

})
// add auth
const addComment = AsyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    let { content } = req.body;
    if (!content) {
        throw new ApiError(400, "content is required to send a message");
    }
    if (!(isValidObjectId(videoId))) {
        throw new ApiError(400, "Wrong video Id");
    }
    if (!req.user) {
        throw new ApiError(400, "user is unauthorized to comment");
    }
    let comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user?._id
    })
    if (!comment) {
        throw new ApiError(400, "Something wrong to do comment");
    }
    return res.status(200).json(new Responce(200, comment, "Sucessfully comment on video"));
})

const updateComment = AsyncHandler(async (req, res) => {
    // TODO: update a comment
    let { commentId } = req.params;
    let { content } = req.body;
    if (!(isValidObjectId(commentId))) {
        throw new ApiError(400, "Wrong comment Id");
    }
    if (!content) {
        throw new ApiError(400, "content is required for updating")
    }
    let newComment = await Comment.findByIdAndUpdate(commentId,
        {
            $set: {
                content: content,
            }
        },
        {
            new: true
        })
    if (!newComment) {
        throw new ApiError(400, "Not updating comment");
    }
    return res.status(200).json(new Responce(400, newComment, "Sucessully updating comment"))
})

const deleteComment = AsyncHandler(async (req, res) => {

    // TODO: delete a comment
    let { commentId } = req.params;
    if (!(isValidObjectId(commentId))) {
        throw new ApiError(400, "Wrong comment Id");
    }
    let deleteComment = await Comment.findByIdAndDelete(commentId);
    if (!deleteComment) {
        throw new ApiError(400, "Your comment cannot delete");
    }
    return res.status(200).json(new Responce(400, deleteComment, "Sucessully delete comment"))

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
// todo: need to add user detail in first function and use moongose aggregate pipeline vs for pagination