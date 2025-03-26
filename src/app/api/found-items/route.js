import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import item from "@/lib/models/item";
import roles from "@/lib/models/location";
import { v2 as cloudinary } from 'cloudinary';
import { nanoid } from 'nanoid';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await dbConnect();

    const findFoundItems = await item.find({ isFoundItem: true });

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
    const foundItemData = await req.json();

    if (!foundItemData.images || !foundItemData.status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: image or status" },
        { status: 400 }
      );
    }

    foundItemData._id = `FI_${nanoid(6)}`;

    const uploadedImages = [];
    for (const image of foundItemData.images) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "found_items",
        public_id: `found_${Date.now()}`,
        overwrite: true,
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
        ],
      });
      uploadedImages.push(uploadResponse.secure_url);
    }

    const newFoundItem = new item({
      ...foundItemData,
      images: uploadedImages,
    });
    await newFoundItem.save();

    return NextResponse.json(newFoundItem);
  } catch (error) {
    console.error("Error in POST method:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}