import mongoose from "mongoose";

const finderSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  item_id: {
    type: String,
  },
  dateValidating: {
    type: Date,
  },
  datePublished: {
    type: Date,
  },
  dateReserved: {
    type: Date,
  },
});

export default mongoose.models.Finder || mongoose.model("Finder", finderSchema);
