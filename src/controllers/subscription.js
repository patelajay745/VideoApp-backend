import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getSubscribedChannels = asyncHandler(async (req, res) => {});
const toggleSubscription = asyncHandler(async (req, res) => {});
const getUserChannelSubscribers = asyncHandler(async (req, res) => {});

export { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers };
