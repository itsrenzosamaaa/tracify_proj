import mongoose from "mongoose";

const MatchItemsSchema = new mongoose.Schema({
  finder: {
    type: String,
    ref: "Finder",
  },
  owner: {
    type: String,
    ref: "Owner",
  },
  matched_date: {
    type: Date,
  },
  request_status: {
    type: String,
    enum: ["Pending", "Approved", "Completed", "Declined", "Canceled"],
  },
  datePending: {
    type: Date,
  },
  dateApproved: {
    type: Date,
  },
  dateCompleted: {
    type: Date,
  },
  dateCanceled: {
    type: Date,
  },
  dateDeclined: {
    type: Date,
  },
  remarks: {
    type: String,
  },
  sharedBy: {
    type: String,
    ref: "User",
  },
});

export default mongoose.models.MatchItem ||
  mongoose.model("MatchItem", MatchItemsSchema);
