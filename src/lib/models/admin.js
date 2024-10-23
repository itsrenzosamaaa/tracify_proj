import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
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
  office_name: {
    type: String,
  },
  office_location: {
    type: String,
  },
  account: {
    type: mongoose.Types.ObjectId,
    ref: 'Account',
  },
});

export default mongoose.models.Admin ||
  mongoose.model("Admin", adminSchema);
