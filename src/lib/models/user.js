import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  emailAddress: {
    type: String,
    unique: true,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  contactNumber: {
    type: String,
  },
  badges: [{
    type: mongoose.Types.ObjectId,
    ref: 'Badge',
  }],
  selectedBadge: { 
    type: mongoose.Types.ObjectId,
    ref: 'Badge',
  },
  school_category: {
    type: String,
    enum: ["Higher Education", "Basic Education"]
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User ||
  mongoose.model("User", userSchema);
