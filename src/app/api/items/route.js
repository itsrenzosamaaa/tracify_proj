import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Items from "@/lib/models/items";
import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
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
    const formData = await req.json();

    const {
      isFoundItem,
      itemSchoolCategory,
      officerId = null, // Set default value correctly
      name,
      category,
      description,
      location,
      date,
      time,
      finder = null, // Set default value correctly
      owner = null, // Set default value correctly
      reason = null,
      status,
      image,
      dateReported = null,
      dateApproved = null,
      dateInvalid = null,
      dateSurrendered = null,
      dateReserved = null,
      dateResolved = null,
      dateMissing = null,
    } = formData;

    // Connect to the database
    await dbConnect();

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      public_id: `items/${Date.now()}_${name.replace(/\s+/g, "_")}`,
      overwrite: true,
      folder: "items",
    });

    const generateRandomItemId = async () => {
      let itemId;
      let isUnique = false;

      // Loop until we generate a unique itemId
      while (!isUnique) {
        // Generate a random number between 1 and 9999
        const randomNumber = Math.floor(Math.random() * 10000); // Adjust range as needed
        // Format the itemId
        itemId = `ITM-${randomNumber.toString().padStart(4, "0")}`;

        // Check if the itemId already exists in the database
        const existingItem = await Items.findOne({ itemId });
        isUnique = !existingItem; // If no existing item found, it's unique
      }

      return itemId;
    };

    const itemId = await generateRandomItemId();

    // Create a new item
    const newItem = new Items({
      itemId,
      itemSchoolCategory,
      isFoundItem,
      officerId,
      name,
      category,
      description,
      location,
      date,
      time,
      finder,
      owner, // Include owner if available
      reason, // Include reason if available
      image: uploadResponse.secure_url,
      status,
      dateReported,
      dateApproved,
      dateInvalid,
      dateSurrendered,
      dateReserved,
      dateResolved,
      dateMissing,
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
