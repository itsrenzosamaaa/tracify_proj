import mongoose from "mongoose";

const MatchItemsSchema = new mongoose.Schema({
  finder: {
    type: mongoose.Types.ObjectId,
    ref: "Finder",
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Owner",
  },
  matched_date: {
    type: Date,
  },
  request_status: {
    type: String,
    enum: [
      "Pending",
      "Approved",
      "Completed",
      "Declined",
      "Canceled",
    ],
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
});

export default mongoose.models.MatchItem || mongoose.model("MatchItem", MatchItemsSchema);
