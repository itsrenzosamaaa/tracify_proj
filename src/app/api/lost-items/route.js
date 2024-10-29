import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import lostItem from "@/lib/models/lost_items";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await dbConnect();

    const fetchLostItems = await lostItem.find().populate('owner');

    return NextResponse.json(fetchLostItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching lost items:", error);
    return NextResponse.json(
      { error: "Failed to fetch lost items" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const lostItemData = await req.json();

    const uploadResponse = await cloudinary.uploader.upload(lostItemData.image, {
      folder: "lost_items", // Store images in a folder named "found_items" on Cloudinary
      public_id: `lost_${Date.now()}`,
      overwrite: true,
    });

    const newLostItem = new lostItem({
      ...lostItemData,
      image: uploadResponse.secure_url,
    });
    await newLostItem.save();

    console.log(newLostItem);

    return NextResponse.json(
      { success: true, message: "Lost Item published" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}