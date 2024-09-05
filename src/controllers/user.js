import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, fullName, password } = req.body;

    if (
        [userName, email, fullName, password].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All filed are is required");
    }

    const existedUser = User.findOne({ $or: [{ username }, { email }] });

    if (existedUser) {
        throw new ApiError(
            409,
            "user with username or email is already registered. "
        );
    }

    console.log("Request filesssssss:", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avtar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImage);

    if (!avtar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = (
        await User.create({
            userName,
            email,
            fullName,
            avatar: avtar.url,
            coverImage: coverImage?.url || "",
            password,
        })
    ).select("-password -refreshToken");

    console.log("created user: ", user);

    if (!user) {
        throw new ApiError(500, "problem in registering user");
    }

    return res.status(201).json(new ApiResponse(200, user, "User Registered "));
});

export { registerUser };
