import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  id: {
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
  role: {
    type: String,
    required: true,
    enum: ["admin", "office", "user"], // Define valid roles
  },
});

export default mongoose.models.Account ||
  mongoose.model("Account", accountSchema);
