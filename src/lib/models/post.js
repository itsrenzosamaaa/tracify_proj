import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      ref: "User",
    },
    caption: {
      type: String,
    },
    item: {
      type: String,
      ref: "Item",
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
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model("Post", postSchema);
