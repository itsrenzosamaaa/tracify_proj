import mongoose from "mongoose";

const LostItemSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
  date: {
    type: Date,
  },
  time: {
    type: String,
  },
  image: {
    type: String,
  },
  reason: {
    type: String,
  },
  status: {
    type: String,
    enum: [
      "Request",
      "Missing",
      "Tracked",
      "Claimed",
      "Invalid",
      "Canceled",
    ],
  },
  dateRequest: {
    type: Date,
  },
  dateMissing: {
    type: Date,
  },
  dateClaimed: {
    type: Date,
  },
  dateTracked: {
    type: Date,
  },
  dateInvalid: {
    type: Date,
  },
  dateCanceled: {
    type: Date,
  },
});

export default mongoose.models.LostItem || mongoose.model("LostItem", LostItemSchema);
