import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  isFoundItem: {
    type: Boolean,
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
      "Matched",
      "Resolved",
      'Missing',
      'Tracked',
      'Claimed',
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
  dateMatched: {
    type: Date,
  },
  dateMissing: {
    type: Date,
  },
  dateTracked: {
    type: Date,
  },
  dateClaimed: {
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
  monitoredBy: {
    type: mongoose.Types.ObjectId,
    ref: "Admin",
  },
});

export default mongoose.models.Item ||
  mongoose.model("Item", ItemSchema);
