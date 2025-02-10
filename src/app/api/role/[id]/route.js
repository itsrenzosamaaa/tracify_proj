import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import role from "@/lib/models/role";

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    await dbConnect();
    const formData = await req.json();

    // First, get the current role to check if name is actually changing
    const currentRole = await role.findById(id);

    if (!currentRole) {
      return NextResponse.json(
        { success: false, message: "Role not found" },
        { status: 404 }
      );
    }

    // Only check for duplicates if the name is actually being changed
    if (
      formData.name &&
      formData.name.toLowerCase() !== currentRole.name.toLowerCase()
    ) {
      const existingRole = await role.findOne({
        _id: { $ne: id }, // Exclude current role from search
        name: { $regex: new RegExp(`^${formData.name}$`, "i") },
      });

      if (existingRole) {
        return NextResponse.json(
          {
            success: false,
            message: `A role with the name "${formData.name}" already exists`,
          },
          { status: 409 }
        );
      }
    }

    const updatedRole = await role.findByIdAndUpdate(
      id,
      { $set: formData },
      { new: true }
    );

    return NextResponse.json(
      { success: true, data: updatedRole },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Error updating role" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = params; // Get the office ID from the URL

  await dbConnect(); // Connect to MongoDB

  try {
    await role.findByIdAndDelete(id);
    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating role" },
      { status: 500 }
    );
  }
}
