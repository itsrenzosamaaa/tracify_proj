import mongoose from "mongoose";

const itemCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    
});

export default mongoose.models.ItemCategory ||
  mongoose.model("ItemCategory", itemCategorySchema);
