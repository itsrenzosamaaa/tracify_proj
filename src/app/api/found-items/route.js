import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import foundItem from "@/lib/models/found_items";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await dbConnect();

    const fetchFoundItems = await foundItem.find()
      .populate({
          path: 'monitoredBy',
          populate: {
              path: 'role', // This populates the role of the monitoredBy
              model: 'Role', // Ensure this matches your role model name
          },
      })
      .populate('finder');

    console.log(fetchFoundItems)

    return NextResponse.json(fetchFoundItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching found items:", error);
    return NextResponse.json(
      { error: "Failed to fetch found items" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const foundItemData = await req.json(); // This will only work for JSON data, not FormData
    
    // Assuming you're sending the image as a URL or base64 from the frontend
    const uploadResponse = await cloudinary.uploader.upload(foundItemData.image, {
      folder: "found_items",
      public_id: `found_${Date.now()}`,
      overwrite: true,
    });

    const newFoundItem = new foundItem({
      ...foundItemData,
      image: uploadResponse.secure_url,
    });
    await newFoundItem.save();

    return NextResponse.json(
      { success: true, message: "Found Item published" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST method:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}