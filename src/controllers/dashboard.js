import mongoose from "mongoose";
import { Video } from "../models/video.js";
import { Subscription } from "../models/subscription.js";
import { Like } from "../models/like.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    //Get the channel stats like total video views, total subscribers, total videos, total likes etc.
});
const getChannelVideos = asyncHandler(async (req, res) => {
    //Get all the videos uploaded by the channel
});

export { getChannelStats, getChannelVideos };
