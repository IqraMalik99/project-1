import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { auth } from "../middleware/auth.middleware.js"
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
const  playlistRouter = Router();
playlistRouter.route("/create").post(auth,createPlaylist)
playlistRouter.route("/getuser:/userId").get(auth,getUserPlaylists)
playlistRouter.route("/getlist/:playlistId").get(auth,getPlaylistById)
playlistRouter.route("/addvideo/:playlistId/:videoId").post(auth,addVideoToPlaylist)
playlistRouter.route("/remove/:playlistId/:videoId").patch(auth,removeVideoFromPlaylist);
playlistRouter.route("/delete/:playlistId").delete(auth,deletePlaylist)
playlistRouter.route("/update/:playlistId").patch(auth,updatePlaylist)
export{playlistRouter}