import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import location from "@/lib/models/location";

export async function GET({ params }) {
  const { id } = params;

  await dbConnect(); // Connect to your MongoDB database

  try {
    const findLocation = await location.findOne({ _id: id }).lean(); // Fetch officer by ID

    if (!findLocation) {
      return NextResponse.json(
        { message: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(findLocation); // Return the officer data
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching location" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    await dbConnect();
    const formData = await req.json();

    // Fetch the current location
    const currentLocation = await location.findById(id);
    if (!currentLocation) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    // Check if the name is changing, and if so, ensure uniqueness
    if (
      formData.name &&
      formData.name.toLowerCase() !== currentLocation.name.toLowerCase()
    ) {
      const existingLocation = await location.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${formData.name}$`, "i") },
      });

      if (existingLocation) {
        return NextResponse.json(
          {
            success: false,
            message: `A location with the name "${formData.name}" already exists`,
          },
          { status: 409 }
        );
      }
    }

    // Check for duplicate areas in provided data (if areas field is updated)
    if (formData.areas) {
      const areaSet = new Set(formData.areas.map((area) => area.toLowerCase()));
      if (areaSet.size !== formData.areas.length) {
        return NextResponse.json(
          {
            success: false,
            message: "Duplicate areas found within the provided data.",
          },
          { status: 400 }
        );
      }

      // Check for duplicate areas in other locations in DB (excluding current location)
      const duplicateAreasInDB = await location.findOne({
        _id: { $ne: id },
        areas: {
          $in: formData.areas.map((area) => new RegExp(`^${area}$`, "i")),
        },
      });

      if (duplicateAreasInDB) {
        const overlappingAreas = duplicateAreasInDB.areas.filter((area) =>
          formData.areas.some(
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

    // Proceed with update if all checks pass
    const updatedLocation = await location.findByIdAndUpdate(
      id,
      { $set: formData },
      { new: true }
    );

    return NextResponse.json(
      { success: true, data: updatedLocation },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error updating location",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = params; // Get the office ID from the URL

  await dbConnect(); // Connect to MongoDB

  try {
    await location.findByIdAndDelete(id);
    return NextResponse.json({ message: "Location deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating location" },
      { status: 500 }
    );
  }
}
