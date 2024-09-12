import mongoose from "mongoose";

const FoundItemsSchema = new mongoose.Schema({
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
    finder: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false, // Handle image uploads (optional)
    },
    status: {
        type: String,
        enum: ['Published', 'Reserved'],
        default: 'Published',
    },
});

export default mongoose.models.FoundItems || mongoose.model('FoundItems', FoundItemsSchema);