import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getUserPlaylists,
} from "../controllers/playlist.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createPlaylist);
router.get("/:playlistId", getPlaylistById);
router.patch("/:playlistId", updatePlaylist);
router.delete("/:playlistId", deletePlaylist);

router.patch("/add/:videoId/:playlistId", addVideoToPlaylist);
router.patch("/remove/:videoId/:playlistId", removeVideoFromPlaylist);

router.get("/user/:userID", getUserPlaylists);

export default router;
