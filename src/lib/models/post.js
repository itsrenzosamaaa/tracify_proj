import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    allowedToPost: {
      type: Boolean,
    },
    author: {
      type: String,
      ref: "User",
    },
    caption: {
      type: String,
    },
    item_name: {
      type: String,
    },
    isFinder: {
      type: Boolean,
    },
    finder: {
      type: String,
      ref: "Finder",
    },
    owner: {
      type: String,
      ref: "Owner",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedBy: {
      type: String,
      ref: "User", // User who shared the post
      default: null,
    },
    sharedAt: {
      type: Date,
      default: null,
    },
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // Reference to the original post if shared
      default: null,
    },
    sharedTo: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model("Post", postSchema);
