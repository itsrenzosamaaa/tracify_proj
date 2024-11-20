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

    const findFoundItems = await item.find({ isFoundItem: true })
      .populate({
        path: 'monitoredBy',
        populate: {
          path: 'role',
          model: 'Role',
        }
      });

    return NextResponse.json(findFoundItems, { status: 200 });
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
    const foundItemData = await req.json(); // This will only work for JSON data, not FormData

    if (!foundItemData.images || !foundItemData.status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: image or status" },
        { status: 400 }
      );
    }

    // Assuming you're sending the image as a URL or base64 from the frontend
    const uploadedImages = [];
    for (const image in foundItemData.images) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "found_items",
        public_id: `found_${Date.now()}`,
        overwrite: true,
      });
      uploadedImages.push(uploadResponse.secure_url);
    }

    if (foundItemData.status === 'Reserved') {
      foundItemData.dateReserved = new Date();
    }

    const newFoundItem = new item({
      ...foundItemData,
      image: uploadedImages,
    });
    await newFoundItem.save();

    return NextResponse.json(newFoundItem);
  } catch (error) {
    console.error("Error in POST method:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}