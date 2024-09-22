import mongoose from "mongoose";

// Nested schema for name fields
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

// Student-specific fields
const studentSchema = new mongoose.Schema({
  year: {
    type: String, // Year (e.g., 1st Year, 2nd Year)
    required: true,
  },
  course: {
    type: String, // Course (e.g., Computer Science, Engineering)
    required: true,
  },
});

// Teacher-specific fields
const teacherSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
});

// Main account schema
const accountSchema = new mongoose.Schema({
  name: {
    type: nameSchema, // Use the nested name schema
    required: function () {
      return this.role === "user";
    },
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
    enum: ["admin", "office", "user"], // Define valid roles
  },
  schoolCategory: {
    type: String,
    enum: ["Basic Education Department", "Higher Education Department"],
    required: function () {
      return this.role === "office";
    },
  },
  department: {
    type: String,
    enum: ["CCS", "CBE", "CTE"],
    required: function () {
      return (
        this.role === "office" &&
        this.schoolCategory === "Higher Education Department"
      );
    },
  },
  student: {
    type: studentSchema,
    required: function () {
      return this.role === "user" && this.userType === "student";
    },
  },
  teacher: {
    type: teacherSchema,
    required: function () {
      return this.role === "user" && this.userType === "teacher";
    },
  },
  userType: {
    type: String,
    enum: ["student", "teacher"],
    required: function () {
      return this.role === "user";
    },
  },
});

export default mongoose.models.Account ||
  mongoose.model("Account", accountSchema);
