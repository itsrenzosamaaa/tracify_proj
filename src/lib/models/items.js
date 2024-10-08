import mongoose from "mongoose";

const ItemsSchema = new mongoose.Schema({
    itemId: {
        type: String,
        unique: true,
    },
    isFoundItem: {
        type: Boolean,
    },
    officerId: {
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
    finder: {
        type: String,
    },
    owner: {
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
    dateReported: {
        type: Date,
    },
    dateApproved: {
        type: Date,
    },
    dateInvalid: {
        type: Date,
    },
    dateSurrendered: {
        type: Date,
    },
    dateReserved: {
        type: Date,
    },
    dateResolved: {
        type: Date,
    },
    dateMissing: {
        type: Date,
    },
});

export default mongoose.models.Items || mongoose.model('Items', ItemsSchema);