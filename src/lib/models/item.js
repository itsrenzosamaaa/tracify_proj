import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  isFoundItem: {
    type: Boolean,
  },
  name: {
    type: String,
  },
  color: {
    type: [String],
  },
  size: {
    type: String,
  },
  category: {
    type: String,
  },
  material: {
    type: String,
  },
  condition: {
    type: String,
  },
  distinctiveMarks: {
    type: String,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
  date_time: {
    type: String,
  },
  images: [
    {
      type: String,
    },
  ],
  reason: {
    type: String,
  },
  status: {
    type: String,
    enum: [
      "Request",
      "Surrender Pending",
      "Published",
      "Matched",
      "Resolved",
      "Missing",
      "Unclaimed",
      "Claimed",
      "Declined",
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
  dateUnclaimed: {
    type: Date,
  },
  dateClaimed: {
    type: Date,
  },
  dateResolved: {
    type: Date,
  },
  dateDeclined: {
    type: Date,
  },
  dateCanceled: {
    type: Date,
  },
  edit: {
    name: { type: String },
    color: { type: [String] },
    size: { type: String },
    category: { type: String },
    material: { type: String },
    condition: { type: String },
    distinctiveMarks: { type: String },
    description: { type: String },
    location: { type: String },
    date_time: { type: String },
    _id: false, // prevent automatic _id creation inside edit
  },
});

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
