import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
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

export default mongoose.models.Owner ||
  mongoose.model("Owner", ownerSchema);
