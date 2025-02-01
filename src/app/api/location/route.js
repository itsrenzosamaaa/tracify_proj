import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import location from "@/lib/models/location";

// GET: Fetch all roles or a specific role based on query parameters
export async function GET() {
  try {
    await dbConnect();
    const findLocation = await location.find(); // Get all roles
    return NextResponse.json(findLocation, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Create a new role
export async function POST(req) {
  try {
    await dbConnect();
    const locationData = await req.json();

    const existingLocation = await location.findOne({
      name: { $regex: new RegExp(`^${locationData.name}$`, 'i') } // Case-insensitive search
    });

    if (existingLocation) {
      return NextResponse.json(
        {
          success: false,
          message: `A location with the name "${locationData.name}" already exists`
        },
        { status: 409 } // 409 Conflict status code
      );
    }

    const newLocation = new location(locationData);
    await newLocation.save();

    return NextResponse.json(
      { success: true, message: "Location created" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
