import mongoose from "mongoose";

const ItemsSchema = new mongoose.Schema({
    isFoundItem: {
        type: Boolean,
        required: true,
    },
    reportedByNotUser: {
        type: Boolean,
        required: true,
    },
    whoReported: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false, // Handle image uploads (optional)
    },
    status: {
        type: String,
        enum: ['Request', 'Validating', 'Published', 'Reserved', 'Resolved', 'Invalid', 'Missing'],
    },
});

export default mongoose.models.Items || mongoose.model('Items', ItemsSchema);