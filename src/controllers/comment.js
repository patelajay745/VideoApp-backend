import { Comment } from "../models/comment.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;
    const { content } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Please provide videoID");
    }

    if (!content) {
        throw new ApiError(400, "Please provide content for comment");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId,
    });

    if (!comment) {
        throw new ApiError(500, "Something went wrong ,please try again");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment has been added successfully")
        );
});

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
});
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Please Provide comment id ");
    }

    const { deletedCount } = await Comment.deleteOne({ _id: commentId });

    if (deletedCount !== 1) {
        throw new ApiError(
            500,
            "Unable to delete the Comment. Please try again."
        );
    }

    return res.status(200).json(new ApiResponse(200, {}, "Comment Deleted"));
});
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!commentId) {
        throw new ApiError(400, "Please Provide comment id ");
    }

    const comment = await Comment.findByIdAndUpdate(
        {
            _id: commentId,
        },
        {
            $set: {
                content: content,
            },
        },
        { new: true }
    );

    if (!comment) {
        throw new ApiError(500, "Something wrong while updating comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment has been updated"));
});

export { addComment, getVideoComments, deleteComment, updateComment };
