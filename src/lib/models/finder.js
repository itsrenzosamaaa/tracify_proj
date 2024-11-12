import mongoose from "mongoose";

const finderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  item: {
    type: mongoose.Types.ObjectId,
    ref: 'Item',
  },
});

export default mongoose.models.Finder ||
  mongoose.model("Finder", finderSchema);
