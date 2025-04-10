import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import match_items from "@/lib/models/match_items";
import finder from "@/lib/models/finder";
import owner from "@/lib/models/owner";
import user from "@/lib/models/user";
import item from "@/lib/models/item";
import role from "@/lib/models/role";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await dbConnect();

    const findMatchItems = await match_items.find().populate({
      path: "finder",
      populate: [
        {
          path: "user",
          model: "User",
          populate: {
            path: "role",
            model: "Role", // or 'roles' based on your model name export
            select: "permissions",
          },
        },
        { path: "item", model: "Item" },
      ],
    });

    return NextResponse.json(findMatchItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching match items:", error);
    return NextResponse.json(
      { error: "Failed to fetch match items" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const matchedData = await req.json();

    const uploadedImages = [];
    for (const image of matchedData.owner.item.images) {
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

    const newMatch = new match_items({
      ...matchedData,
      "matchedData.owner.item.images": uploadedImages,
    });
    await newMatch.save();

    return NextResponse.json(
      { success: true, message: "Match Created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST method:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
