import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const user_id = req.user?._id;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: user_id,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "Tweet has been inserted successfully")
        );
});

const getUserTweets = asyncHandler(async (req, res) => {
    
    const { userID } = req.params;

    if (!userID) {
        throw new ApiError(400, "Please provide a valid userId");
    }

    const tweets = await Tweet.find({ owner: userID }).select("-__v -owner");

    if (!tweets) {
        throw new ApiError(404, "No tweets found in the database");
    }

    if (tweets.length == 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "No tweets found in the database"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId) {
        throw new ApiError(400, "Please provide a valid tweetId");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        { _id: tweetId },
        {
            $set: {
                content,
            },
        },
        { new: true }
    ).select("-__v -owner");

    if (!tweet) {
        throw new ApiError(500, "Something wrong while updating tweet");
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated"));
});
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Please provide a valid tweetId");
    }

    const { deletedCount } = await Tweet.deleteOne({ _id: tweetId });

    if (deletedCount !== 1) {
        throw new ApiError(
            500,
            "Unable to delete the tweet. Please try again."
        );
    }
    return res.status(200).json(new ApiResponse(200, {}, "Tweet Deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
