import mongoose from "mongoose";
import { Videos } from "../models/video.js";
import { Subscription } from "../models/subscription.js";
import { Like } from "../models/like.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    //Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user?._id;

    const channelStats = await User.aggregate([
        {
            $match: {
                _id: userId,
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "numberOfLikes",
                        },
                    },
                    {
                        $addFields: {
                            totalLikes: {
                                $size: "$numberOfLikes",
                            },
                        },
                    },
                    {
                        $project: {
                            totalLikes: 1,
                        },
                    },
                ],
            },
        },

        {
            $addFields: {
                totalVideos: {
                    $size: "$videos",
                },
                allLikes: {
                    $sum: "$videos.totalLikes",
                },
                totalViews: {
                    $sum: "$videos.views",
                },
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
            },
        },
        {
            $project: {
                subscribersCount: 1,
                totalVideos: 1,
                allLikes: 1,
                totalViews: 1,
            },
        },
    ]);

    if (!channelStats) {
        throw new ApiError(500, "Something went wrong while retrieve data.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channelStats, "Data is fetched"));
});
const getChannelVideos = asyncHandler(async (req, res) => {
    //Get all the videos uploaded by the channel

    const userId = req.user?._id;

    const videos = await Videos.find({ owner: userId }).select("-owner -__v");

    if (!videos || videos.length == 0) {
        throw new ApiError(500, "No Videos Found for this user");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos are fetched"));
});

export { getChannelStats, getChannelVideos };
