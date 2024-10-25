import mongoose from "mongoose";

const LostItemSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Student",
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
      "Claimed",
      "Invalid",
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
  dateInvalid: {
    type: Date,
  },
});

export default mongoose.models.LostItem || mongoose.model("LostItem", LostItemSchema);
