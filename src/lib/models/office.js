import mongoose from "mongoose";

const officeSchema = new mongoose.Schema({
  accountId: {
    type: String,
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
  schoolCategory: {
    type: String,
    enum: ["Basic Education", "Higher Education"],
  },
  officeName: { type: String },
  officeAddress: { type: String },
});

export default mongoose.models.Office ||
  mongoose.model("Office", officeSchema);
