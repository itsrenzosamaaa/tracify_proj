import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    name: { type: String },
});

export default mongoose.models.Badge ||
  mongoose.model("Badge", badgeSchema);
