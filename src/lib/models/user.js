import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
    type: mongoose.Types.ObjectId,
    ref: 'Role',
  },
});

export default mongoose.models.User ||
  mongoose.model("User", userSchema);
