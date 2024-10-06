import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Items from "@/lib/models/items";
import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await dbConnect();
    const items = await Items.find();

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error fetching items: ", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const {
      isFoundItem,
      officerId,
      name,
      category,
      description,
      location,
      date,
      time,
      finder,
      image,
      status,
    } = await req.json();
    await dbConnect();

    const uploadResponse = await cloudinary.uploader.upload(image, {
      public_id: `items/${Date.now()}_${name.replace(/\s+/g, "_")}`,
      overwrite: true,
      folder: "items",
    });

    const newItem = new Items({
      isFoundItem,
      officerId,
      name,
      category,
      description,
      location,
      date,
      time,
      finder,
      image: uploadResponse.secure_url,
      status,
    });

    await newItem.save();
    return NextResponse.json(
      { success: true, message: "Item added" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding item: ", error);
    return NextResponse.json(
      { success: false, message: "Failed to create item" },
      { status: 500 }
    );
  }
}
