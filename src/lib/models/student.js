import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
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
    enum: ["Higher Education", "Basic Education"]
  },
  account: {
    type: mongoose.Types.ObjectId,
    ref: 'Account',
  },
});

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
