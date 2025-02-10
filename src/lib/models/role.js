import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  color: {
    type: String,
  },
  permissions: [
    {
      type: String,
    },
  ],
});

export default mongoose.models.Role || mongoose.model("Role", roleSchema);
