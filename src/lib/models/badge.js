import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  title: { type: String },
  titleColor: { type: String },
  titleShimmer: { type: Boolean },
  titleOutlineColor: { type: String },
  description: { type: String },
  shape: { type: String },
  shapeColor: { type: String },
  bgShape: { type: String },
  bgColor: { type: String },
  bgOutline: { type: String },
  condition: { type: String },
  meetConditions: { type: Number },
});

export default mongoose.models.Badge ||
  mongoose.model("Badge", badgeSchema);
