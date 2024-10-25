import mongoose from "mongoose";

const FoundItemSchema = new mongoose.Schema({
  finder: {
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
      "Validating",
      "Published",
      "Claim Request",
      "Reserved",
      "Resolved",
      "Invalid",
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
  dateReserved: {
    type: Date,
  },
  dateResolved: {
    type: Date,
  },
  dateInvalid: {
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
