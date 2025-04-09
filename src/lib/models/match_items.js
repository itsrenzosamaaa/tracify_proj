import mongoose from "mongoose";

const MatchItemsSchema = new mongoose.Schema({
  finder: {
    type: String,
    ref: "Finder",
  },
  owner: {
    user: {
      type: String,
      ref: "User",
    },
    item: {
      name: {
        type: String,
      },
      color: {
        type: [String],
      },
      category: {
        type: String,
      },
      size: {
        type: String,
      },
      material: {
        type: String,
      },
      description: {
        type: String,
      },
      condition: {
        type: String,
      },
      distinctiveMarks: {
        type: String,
      },
      location: {
        type: String,
      },
      date_time: {
        type: String,
      },
      images: {
        type: [String],
      },
      answers: {
        type: [String],
      },
    },
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
