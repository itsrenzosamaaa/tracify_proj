import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  item: {
    type: mongoose.Types.ObjectId,
  },
  isFoundItem: {
    type: Boolean,
  },
  quantity: {
    type: Number,
  },
  feedback: {
    type: String,
  },
  compliments: {
    type: [String],
  },
  done_review: {
    type: Boolean,
  },
  date_created: {
    type: Date,
  },
  date_edited: {
    type: Date,
  },
});

export default mongoose.models.Rating ||
  mongoose.model("Rating", ratingSchema);
