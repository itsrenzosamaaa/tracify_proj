import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  profile_picture: {
    type: String,
  },
  emailAddress: {
    type: String,
    unique: true,
  },
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
    enum: ["Higher Education", "Basic Education"],
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
  birthday: {
    type: Date,
  },
  resolvedItemCount: {
    type: Number,
    default: 0,
  },
  shareCount: {
    type: Number,
    default: 0,
  },
  canUserReportLostItem: {
    type: Date,
    default: Date.now,
  },
  studentProfile: {
    category: {
      type: String,
      enum: ["BED", "HED"],
    },
    gradeLevel: {
      type: String,
      enum: [
        "Grade 7",
        "Grade 8",
        "Grade 9",
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    strand: {
      type: String,
      enum: ["TVL-Programming", "STEM", "HUMSS", "TVL-Cookery", "ABM", "GAS"],
    },
    yearLevel: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    department: {
      type: String,
      enum: [
        "College of Teacher Education",
        "College of Business Education",
        "College of Computer Studies",
      ],
    },
    course: {
      type: String,
      enum: [
        "Bachelor of Science in Business Administration",
        "Bachelor of Science in Entrepreneurship",
        "Bachelor of Elementary Education",
        "Bachelor of Secondary Education",
        "Bachelor of Science in Information Technology",
        "Associate in Computer Technology",
      ],
    },
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
