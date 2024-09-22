import mongoose from "mongoose";

const UpdateSchema = new mongoose.Schema({
    updateType: {
        type: String,
        required: true,
        enum: ['Status Change', 'Rate', 'Badge'],
    },
    description: {
        type: String,
        required: true,
    },
    updatedBy: {
        type: String,
        required: true,
    },
    updatedFor: {
        type: String,
        required: true,
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.models.Updates || mongoose.model('Updates', UpdateSchema);