import mongoose, { omitUndefined, Schema } from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const Like = mongoose.Model("Like", likeSchema);

export { Like };
