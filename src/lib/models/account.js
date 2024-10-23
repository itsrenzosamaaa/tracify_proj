import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ["admin", "student"],
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Account ||
  mongoose.model("Account", accountSchema);
