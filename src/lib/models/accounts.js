import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  contactNumber: {
    type: String,
  },
  emailAddress: {
    type: String,
  },
  role: {
    type: String,
  },
});

export default mongoose.models.Account ||
  mongoose.model("Account", accountSchema);
