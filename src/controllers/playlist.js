import { Playlist } from "../models/playlist.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(
            400,
            "Please Provide name and description for playlist"
        );
    }

    const playList = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });

    if (!playList) {
        throw new ApiError(500, "Something went wrong, please try again");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, playList, "New Playlist has been created."));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Please provide valid playlistId ");
    }

    const playlist = await Playlist.find({ _id: playlistId }).select(
        "-createdAt -updatedAt -__v"
    );

    if (!playlist || playlist.length == 0) {
        throw new ApiError(400, "No playlist found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist has been fetched"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId) {
        throw new ApiError(400, "Please provide valid playlist");
    }

    if (!name && !description) {
        throw new ApiError(400, "Please name/description to update");
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId },
        {
            $set: updateFields,
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Playlist has been updated")
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Please Provide PlaylistId");
    }

    const { deletedCount } = await Playlist.deleteOne({ _id: playlistId });

    if (deletedCount !== 1) {
        throw new ApiError(
            500,
            "Unable to delete the Playlist. Please try again."
        );
    }

    return res.status(200).json(new ApiResponse(200, {}, "Playlist Deleted"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId },
        {
            $push: {
                videos: videoId,
            },
        },
        {
            new: true,
        }
    );

    if (!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong,please try again");
    }

    console.log(updatedPlaylist);

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Video has been added to ")
        );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Plese provide playlistId");
    }
    if (!videoId) {
        throw new ApiError(400, "please provide videoId to remove");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId },
        {
            $pull: {
                videos: videoId,
            },
        },
        { new: true }
    );

    if (!updatePlaylist) {
        throw new ApiError(500, "Something went wrong while updating.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Playlist has been updated")
        );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userID } = req.params;

    const playLists = await Playlist.find({
        owner: userID,
    });

    if (!playLists || playLists.length == 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "No playlist Found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playLists, "Playlists are fetched "));
});

export {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getUserPlaylists,
};
