import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  sender: {
    type: String,
    ref: 'User',
  },
  receiver: {
    type: String,
    ref: 'User',
  },
  item: {
    type: String,
    ref: "Item",
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
