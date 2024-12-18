import mongoose from "mongoose";

const finderSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    ref: 'User',
  },
  item: {
    type: String,
    ref: 'Item',
  },
});

export default mongoose.models.Finder ||
  mongoose.model("Finder", finderSchema);
