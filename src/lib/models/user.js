import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  accountId: {
    type: String,
  },
  userRole: {
    type: String,
    enum: ["student", "teacher"],
  },
  email: {
    type: String,
    index: {
      unique: true,
      sparse: true,
    },
  },
  contactNumber: {
    type: String,
  },
  schoolCategory: {
    type: String,
    enum: ["Basic Education", "Higher Education"],
  },
  firstname: {
    type: String,
  },
  middlename: {
    type: String,
  },
  lastname: {
    type: String,
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
