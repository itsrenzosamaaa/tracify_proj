import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  item_id: {
    type: String,
  },
  dateMissing: {
    type: Date,
  },
});

export default mongoose.models.Owner || mongoose.model("Owner", ownerSchema);
