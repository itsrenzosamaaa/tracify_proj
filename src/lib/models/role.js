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
  isStudentRole: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.models.Role || mongoose.model("Role", roleSchema);
