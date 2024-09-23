import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  id: {
    type: String,
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
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    index: {
      unique: true,
      sparse: true,
    }
  },
  contactNumber: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "office", "user"], // Define valid roles
  },
  userRole: {
    type: String,
    enum: ["student", "teacher"],
  },
  schoolCategory: {
    type: String,
    enum: ["Basic Education", "Higher Education"],
  },
  officeName: { type: String },
  officeAddress: { type: String },
});

export default mongoose.models.Account ||
  mongoose.model("Account", accountSchema);
