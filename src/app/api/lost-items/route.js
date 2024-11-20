import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import item from "@/lib/models/item";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await dbConnect();

    const findLostItems = await item.find({ isFoundItem: false });

    return NextResponse.json(findLostItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const lostItemData = await req.json(); // This will only work for JSON data, not FormData

    if (!lostItemData.images || !lostItemData.status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: image or status" },
        { status: 400 }
      );
    }

    // Assuming you're sending the image as a URL or base64 from the frontend
    const uploadedImages = [];
    for (const image in lostItemData.images) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "lost_items",
        public_id: `lost_${Date.now()}`,
        overwrite: true,
      });
      uploadedImages.push(uploadResponse.secure_url);
    }

    if (lostItemData.status === 'Unclaimed') {
      lostItemData.dateUnclaimed = new Date();
    }

    const newLostItem = new item({
      ...lostItemData,
      image: uploadedImages,
    });
    await newLostItem.save();

    return NextResponse.json(newLostItem);
  } catch (error) {
    console.error("Error in POST method:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}