import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Ensures role names are unique
  areas: [{ type: String }],
});

export default mongoose.models.Location || mongoose.model("Location", locationSchema);
