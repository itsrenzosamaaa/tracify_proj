import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  receiver: {
    type: String,
    ref: 'User',
  },
  message: {
    type: String,
  },
  type: {
    type: String,
  },
  markAsRead: {
    type: Boolean,
  },
  dateNotified: {
    type: Date,
  },
});

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
