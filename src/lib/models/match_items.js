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
  status: {
    type: String,
    enum: [
      "Claim Request",
      "To be Claim",
      "Claimed",
      "Canceled",
      "Decline",
    ],
  },
  dateClaimRequest: {
    type: Date,
  },
  dateToBeClaim: {
    type: Date,
  },
  dateClaimed: {
    type: Date,
  },
  dateCanceled: {
    type: Date,
  },
  dateDecline: {
    type: Date,
  },
});

export default mongoose.models.MatchItem || mongoose.model("MatchItem", MatchItemsSchema);
