import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!videoId) {
        throw new ApiError(400, "Please provide videoId");
    }

    const likedVideo = await Like.findOne({ video: videoId, likedBy: userId });

    if (!likedVideo) {
        const newLikedVideo = await Like.create({
            video: videoId,
            likedBy: userId,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, newLikedVideo, "Like has been added"));
    }

    await Like.deleteOne({ _id: likedVideo._id });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unliked successfully"));
});
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!commentId) {
        throw new ApiError(400, "Please provide commentId");
    }

    const likedcomment = await Like.findOne({
        comment: commentId,
        likedBy: userId,
    });

    if (!likedcomment) {
        const newLikedComment = await Like.create({
            comment: commentId,
            likedBy: userId,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, newLikedComment, "Like has been added"));
    }

    await Like.deleteOne({ _id: likedcomment._id });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unliked successfully"));
});
const toggelTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!tweetId) {
        throw new ApiError(400, "Please provide tweetId");
    }

    const likedTweet = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (!likedTweet) {
        const newLikedTweet = await Like.create({
            tweet: tweetId,
            likedBy: userId,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, newLikedTweet, "Like has been added"));
    }

    await Like.deleteOne({ _id: likedTweet._id });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unliked successfully"));
});
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true, $ne: null },
    });

    if (!likedVideos || likedVideos.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "No liked video found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked Videos are retrieved"));
});

export { toggleVideoLike, toggleCommentLike, toggelTweetLike, getLikedVideos };
