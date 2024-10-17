import mongoose from "mongoose";

const ItemsSchema = new mongoose.Schema({
    isFoundItem: {
        type: Boolean,
    },
    user_id: {
        type: String,
    },
    name: {
        type: String,
    },
    category: {
        type: String,
    },
    description: {
        type: String,
    },
    location: {
        type: String,
    },
    date: {
        type: Date,
    },
    time: {
        type: String,
    },
    image: {
        type: String,
    },
    reason: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Request', 'Validating', 'Published', 'Reserved', 'Resolved', 'Invalid', 'Missing'],
    },
    dateRequest: {
        type: Date,
    },
    dateResolved: {
        type: Date,
    },
    dateInvalid: {
        type: Date,
    }
});

export default mongoose.models.Items || mongoose.model('Items', ItemsSchema);