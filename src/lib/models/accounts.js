import mongoose from "mongoose";

const nameSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  middlename: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: true,
  },
});

const account = new mongoose.Schema({
  name: {
    type: nameSchema,
    required: true,
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
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Account || mongoose.model("Account", account);
