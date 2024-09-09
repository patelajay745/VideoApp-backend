import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.js";
import { Subscription } from "../models/subscription.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    uploadOnCloudinary,
    deleteFilrOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, fullName, password } = req.body;

    if (
        [userName, email, fullName, password].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All filed are is required");
    }

    const existedUser = await User.findOne({ $or: [{ userName }, { email }] });

    if (existedUser) {
        throw new ApiError(
            409,
            "user with username or email is already registered. "
        );
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path || "";

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avtar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avtar) {
        throw new ApiError(400, "Avatar file is required");
    }

    let user = await User.create({
        userName,
        email,
        fullName,
        avatar: avtar.url,
        coverImage: coverImage?.url || "",
        password,
    });

    //.select("-password -refreshToken"); after query database

    user = user.toObject();
    delete user.password;
    delete user.refreshToken;

    if (!user) {
        throw new ApiError(500, "problem in registering user");
    }

    return res.status(201).json(new ApiResponse(200, user, "User Registered "));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "username or email is required");
    }

    let user = await User.findOne({
        $or: [{ email }],
    });

    if (!user) {
        throw new ApiError(400, "User doesn't exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "password is wrong");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    user.refreshToken = refreshToken;
    user = user.toObject();
    delete user.password;

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: user, accessToken, refreshToken },
                "user logged In sucessfully"
            )
        );
});

const logoutuser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "unauthorized request");
        }

        console.log("incomingRefreshToken", incomingRefreshToken);
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.find({ _id: decodedToken?._id });

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token");
        }

        if (incomingRefreshToken !== user?.[0].refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user?.[0]._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(500, error.message);
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password is changed"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetched successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avtarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avtarLocalPath) {
        throw new ApiError(400, "avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avtarLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Something wrong in uploading file");
    }

    const urlOfFileToBeDeleted = req.user?.avatar;

    if (urlOfFileToBeDeleted) {
        const response = await deleteFilrOnCloudinary(
            urlOfFileToBeDeleted,
            "image"
        );
    }

    const updatedUser = await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avtar is updated"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
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
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    if: {
                        $in: [req.user?._id, "$subscriptions.subscriber"],
                    },
                    then: true,
                    else: false,
                },
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
            },
        },
    ]);

    if (!channel.length) {
        throw new ApiError(404, "channel does not exists");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel?.[0], "Channel retrieved"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
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
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory, "Watch history fetched")
        );
});

export {
    registerUser,
    loginUser,
    logoutuser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory,
};
