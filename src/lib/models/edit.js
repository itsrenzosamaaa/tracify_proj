import mongoose from "mongoose";

const EditSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
  },
  item: {
    type: String,
    ref: "Item",
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
});

export default mongoose.models.Edit || mongoose.model("Edit", EditSchema);
