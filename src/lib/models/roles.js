import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Ensures role names are unique
  // User permissions
  permissions: {
    viewAdminsList: { type: Boolean, default: false },
    addAdmin: { type: Boolean, default: false },
    editAdmin: { type: Boolean, default: false },
    deleteAdmin: { type: Boolean, default: false },
    viewUsersList: { type: Boolean, default: false },
    // Role Management
    viewRoles: { type: Boolean, default: false },
    addRole: { type: Boolean, default: false },
    editRole: { type: Boolean, default: false },
    deleteRole: { type: Boolean, default: false },
    // Item management
    publishItems: { type: Boolean, default: false },
    manageRequestReportedFoundItems: { type: Boolean, default: false },
    // viewValidatingItems: { type: Boolean, default: false },
    // viewPublishedItems: { type: Boolean, default: false },
    manageRequestItemRetrieval: { type: Boolean, default: false },
    // viewReservedItems: { type: Boolean, default: false },
    viewItemHistory: { type: Boolean, default: false },
    manageRequestReportedLostItems: { type: Boolean, default: false },
    // viewMissingItems: { type: Boolean, default: false },
    // Badge Management
    viewBadges: { type: Boolean, default: false },
    addBadge: { type: Boolean, default: false },
    editBadge: { type: Boolean, default: false },
    deleteBadge: { type: Boolean, default: false },
    // Ratings management
    viewRatings: { type: Boolean, default: false },
    addRatings: { type: Boolean, default: false },
    updateRatings: { type: Boolean, default: false },
    deleteRatings: { type: Boolean, default: false },
  },
});

export default mongoose.models.Role || mongoose.model("Role", roleSchema);
