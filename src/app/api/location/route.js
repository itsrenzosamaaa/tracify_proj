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
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const locationData = await req.json();

    // Check if a location with the same name exists (case-insensitive)
    const existingLocation = await location.findOne({
      name: { $regex: new RegExp(`^${locationData.name}$`, "i") },
    });

    if (existingLocation) {
      return NextResponse.json(
        {
          success: false,
          message: `A location with the name "${locationData.name}" already exists`,
        },
        { status: 409 }
      );
    }

    // Check for duplicate areas within the provided locationData.areas array
    if (locationData.areas) {
      const areaSet = new Set(
        locationData.areas.map((area) => area.toLowerCase())
      );
      if (areaSet.size !== locationData.areas.length) {
        return NextResponse.json(
          {
            success: false,
            message: "Duplicate areas found within the provided data.",
          },
          { status: 400 }
        );
      }

      // Also, check if any area already exists in other location documents
      const duplicateAreasInDB = await location.findOne({
        areas: {
          $in: locationData.areas.map((area) => new RegExp(`^${area}$`, "i")),
        },
      });

      if (duplicateAreasInDB) {
        const overlappingAreas = duplicateAreasInDB.areas.filter((area) =>
          locationData.areas.some(
            (inputArea) => inputArea.toLowerCase() === area.toLowerCase()
          )
        );

        return NextResponse.json(
          {
            success: false,
            message: `The following areas already exist: ${overlappingAreas.join(
              ", "
            )}`,
          },
          { status: 409 }
        );
      }
    }

    // If all checks pass, save the new location
    const newLocation = new location(locationData);
    await newLocation.save();

    return NextResponse.json(
      { success: true, message: "Location created" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
