import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    //const subscribedChannels = await Subscription.find({ subscriber: userId });
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: { subscriber: userId },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                channel: {
                    $first: "$channel",
                },
            },
        },
        {
            $project: { channel: 1, _id: 0 },
        },
    ]);

    if (!subscribedChannels || subscribedChannels.length == 0) {
        throw new ApiError(500, "No Channels Found for this user");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Channels are fetched"));
});
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!channelId) {
        throw new ApiError(400, "Please provide channelId");
    }

    const subscribedChannel = await Subscription.findOne({
        channel: channelId,
        subscriber: userId,
    });

    if (!subscribedChannel) {
        const newSubscribedChannel = await Subscription.create({
            channel: channelId,
            subscriber: userId,
        });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    newSubscribedChannel,
                    "Subscription has been added"
                )
            );
    }

    await Subscription.deleteOne({ _id: subscribedChannel._id });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
});
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (!subscriberId) {
        throw new ApiError(400, "Please provide subscriberId");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(subscriberId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",

                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscriber",
                },
            },
        },
        {
            $project: { subscriber: 1, _id: 0 },
        },
    ]);

    if (!subscribedChannels || subscribedChannels.length == 0) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "No Subscribers Found for this user",
                    "Subscribers are fetched"
                )
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannels, "Subscribers are fetched")
        );
});

export { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers };
