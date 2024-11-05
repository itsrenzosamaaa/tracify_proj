import mongoose from "mongoose";

const FoundItemSchema = new mongoose.Schema({
  finder: {
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
      "Validating",
      "Published",
      "Claim Request",
      "Reserved",
      "Resolved",
      "Invalid",
      "Canceled",
    ],
  },
  dateRequest: {
    type: Date,
  },
  dateValidating: {
    type: Date,
  },
  datePublished: {
    type: Date,
  },
  dateClaimRequest: {
    type: Date,
  },
  dateReserved: {
    type: Date,
  },
  dateResolved: {
    type: Date,
  },
  dateInvalid: {
    type: Date,
  },
  dateCanceled: {
    type: Date,
  },
  matched: {
    type: mongoose.Types.ObjectId,
    ref: "LostItem",
  },
  monitoredBy: {
    type: mongoose.Types.ObjectId,
    ref: "Admin",
  },
});

export default mongoose.models.FoundItem ||
  mongoose.model("FoundItem", FoundItemSchema);
