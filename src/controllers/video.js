import { Videos } from "../models/video.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    uploadOnCloudinary,
    deleteFilrOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const numberOfVideoToBeSkippedForPagintion = page * limit - limit;

    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    // Check if query is provided or not. If provided then a filter object is created to search for videos where the title matches the query
    const filter = query ? { title: { $regex: query, $options: "i" } } : {};

    if (userId) {
        filter.owner = userId;
    }

    const searchResult = await Videos.find({ owner: userId })
        .limit(parseInt(limit))
        .skip(parseInt(numberOfVideoToBeSkippedForPagintion));

    const totalVideos = await Videos.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / limit);

    if (searchResult.length == 0) {
        throw new ApiError(400, "No videos found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos: searchResult,
                totalPages,
                currentPage: parseInt(page),
            },
            "Videos are Fetched"
        )
    );
});
const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const user = req.user;
    const videoLocalPath = req.files?.videoFile?.[0]?.path || "";
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path || "";

    const deleteFilesOnError = async (videoPath, thumbnailPath) => {
        const deleteThumbnailResponse = await deleteFilrOnCloudinary(
            thumbnailPath,
            "image"
        );
        const deleteVideoResponse = await deleteFilrOnCloudinary(
            videoPath,
            "video"
        );
        console.log(deleteThumbnailResponse, deleteVideoResponse);
    };

    if (!title || !description) {
        throw new ApiError(
            400,
            "Please provide title and description for the video."
        );
    }

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Please provide video and thumbnail.");
    }

    const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!uploadedVideo || !uploadedThumbnail) {
        throw new ApiError(500, "Something went wrong, please try again.");
    }

    const video = await Videos.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        owner: user?._id,
        title: title,
        description: description,
        duration: parseInt(uploadedVideo.duration),
    });

    if (!video) {
        await deleteFilesOnError(videoUrl, thumbnailUrl);
        throw new ApiError(500, "Something went wrong please try again");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video is uploaded"));
});
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Please provide videoId");
    }

    console.log("videoid", videoId);

    const video = await Videos.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videoOwner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                owner: {
                    $first: "$videoOwner",
                },
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                _id: 1,
            },
        },
    ]);

    if (!video) {
        throw new ApiError(500, "Error while fetching video data");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video data is fetched"));

    // const video = await Videos.findById({ videoId }).select("-");
});
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if (!videoId) {
        throw new ApiError(400, "Please provide vidoeId");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Please provide new thumbnail");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(
            500,
            "something went wrong while uploading thumbnail, Please try again"
        );
    }

    await Videos.findByIdAndUpdate(
        { _id: videoId },
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url,
            },
        },
        { new: true }
    );

    const video = await Videos.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videoOwner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                owner: {
                    $first: "$videoOwner",
                },
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                _id: 1,
            },
        },
    ]);

    if (!video) {
        throw new ApiError(500, "Error while fetching video data");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video details have been updated successfully"
            )
        );
});
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Please provide videoId");
    }
    const video = await Videos.findById({ _id: videoId });

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const videoUrl = video.videoFile;
    const imageUrl = video.thumbnail;

    const { deletedCount } = await Videos.deleteOne({ _id: videoId });

    if (deletedCount !== 1) {
        throw new ApiError(
            500,
            "something went wrong while deleting data,please try again"
        );
    }
    await deleteFilrOnCloudinary(videoUrl, "video");
    await deleteFilrOnCloudinary(imageUrl, "image");

    return res.status(200).json(new ApiResponse(200, {}, "Video is Deleted"));
});
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Please provide videoId");
    }

    const OldVideoData = await Videos.findById({ _id: videoId });

    if (!OldVideoData) {
        throw new ApiError(404, "Video not found");
    }

    const video = await Videos.findByIdAndUpdate(
        { _id: videoId },
        {
            $set: {
                isPublished: !OldVideoData.isPublished,
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video status changed"));
});

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
