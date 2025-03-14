import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import item from "@/lib/models/item";
import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";
import path from "path";

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

    lostItemData._id = `LI_${nanoid(6)}`;

    // Assuming you're sending the image as a URL or base64 from the frontend
    const uploadedImages = [];
    if (lostItemData.images && lostItemData.images.length > 0) {
      for (const image of lostItemData.images) {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "lost_items",
          public_id: `lost_${Date.now()}`,
          overwrite: true,
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
          ],
        });
        uploadedImages.push(uploadResponse.secure_url);
      }
    } else {
      // ✅ Upload placeholder from public folder if no image provided
      const placeholderPath = path.join(
        process.cwd(),
        "public",
        "placeholder.png"
      );

      const uploadResponse = await cloudinary.uploader.upload(placeholderPath, {
        folder: "lost_items",
        public_id: `lost_${Date.now()}`,
        overwrite: true,
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
        ],
      });
      uploadedImages.push(uploadResponse.secure_url);
    }

    const newLostItem = new item({
      ...lostItemData,
      images: uploadedImages,
    });
    await newLostItem.save();

    return NextResponse.json(newLostItem);
  } catch (error) {
    console.error("Error in POST method:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
