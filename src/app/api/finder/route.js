import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import finder from "@/lib/models/finder";
import items from "@/lib/models/items";

export async function GET() {
  try {
    await dbConnect();
    const getFinder = await finder.find().populate(item_id);

    return NextResponse.json(getFinder, { status: 200 });
  } catch (error) {
    console.error("Error fetching finder: ", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch finder" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const formData = await req.json();

    const {
      isFoundItem,
      user_id = null, // Set default value correctly
      name,
      category,
      description,
      location,
      date,
      time,
      reason = null,
      status,
      image,
      dateRequest = null,
      dateResolved = null,
      dateInvalid = null,
    } = formData;

    // Connect to the database
    await dbConnect();

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      public_id: `items/${Date.now()}_${name.replace(/\s+/g, "_")}`,
      overwrite: true,
      folder: "items",
    });

    // Create a new item
    const newItem = new Items({
      isFoundItem,
      user_id,
      name,
      category,
      description,
      location,
      date,
      time,
      reason, // Include reason if available
      image: uploadResponse.secure_url,
      status,
      dateRequest,
      dateResolved,
      dateInvalid,
    });

    // Save the new item to the database
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
