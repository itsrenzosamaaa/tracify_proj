import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Ensures role names are unique
  schoolCategory: {
    type: String,
    enum: ["All", "Basic Department", "Higher Department"],
    required: true,
  },
  userType: { 
    type: String, 
    enum: ['Admin', 'User'],
    required: true,
  },
  // User permissions
  permissions: {
    viewUserList: { type: Boolean, default: false },
    addUser: { type: Boolean, default: false },
    editUser: { type: Boolean, default: false },
    deleteUser: { type: Boolean, default: false },
    // Role Management
    viewRoles: { type: Boolean, default: false },
    addRole: { type: Boolean, default: false },
    editRole: { type: Boolean, default: false },
    deleteRole: { type: Boolean, default: false },
    // User profile permissions
    viewUserProfile: { type: Boolean, default: false },
    // Item management
    publishItems: { type: Boolean, default: false },
    reportItems: { type: Boolean, default: false },
    matchItems: { type: Boolean, default: false },
    viewMyItems: { type: Boolean, default: false },
    viewRequestReportedFoundItems: { type: Boolean, default: false },
    viewValidatingItems: { type: Boolean, default: false },
    viewPublishedItems: { type: Boolean, default: false },
    viewRequestItemRetrieval: { type: Boolean, default: false },
    viewReservedItems: { type: Boolean, default: false },
    viewItemHistory: { type: Boolean, default: false },
    viewRequestReportedLostItems: { type: Boolean, default: false },
    viewMissingItems: { type: Boolean, default: false },
    // Badge Management
    viewBadges: { type: Boolean, default: false },
    addBadge: { type: Boolean, default: false },
    editBadge: { type: Boolean, default: false },
    deleteBadge: { type: Boolean, default: false },
    awardBadgesToUser: { type: Boolean, default: false },
    removeBadgesToUser: { type: Boolean, default: false },
    // Ratings management
    viewRatings: { type: Boolean, default: false },
    addRatings: { type: Boolean, default: false },
    updateRatings: { type: Boolean, default: false },
    deleteRatings: { type: Boolean, default: false },
  },
});

export default mongoose.models.Role || mongoose.model("Role", roleSchema);
