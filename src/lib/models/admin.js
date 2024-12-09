import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
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
  school_category: {
    type: String,
    enum: ["All", "Higher Education", "Basic Education"]
  },
  role: {
    type: mongoose.Types.ObjectId,
    ref: 'Role',
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Admin ||
  mongoose.model("Admin", adminSchema);
