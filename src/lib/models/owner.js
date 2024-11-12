import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  item: {
    type: mongoose.Types.ObjectId,
    ref: 'Item',
  },
});

export default mongoose.models.Owner ||
  mongoose.model("Owner", ownerSchema);
