import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  profile_picture: {
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
    default: [],
  }],
  selectedBadge: { 
    type: mongoose.Types.ObjectId,
    ref: 'Badge',
    default: null,
  },
  school_category: {
    type: String,
    enum: ["Higher Education", "Basic Education"]
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
  resolvedItemCount: {
    type: Number,
    default: 0,
  },
  ratingsCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.User ||
  mongoose.model("User", userSchema);
