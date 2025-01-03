import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Role from "@/lib/models/roles";

// GET: Fetch all roles or a specific role based on query parameters
export async function GET() {
  try {
    await dbConnect();
    const findRole = await Role.find(); // Get all roles
    return NextResponse.json(findRole, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Create a new role
export async function POST(req) {
  try {
    await dbConnect();
    const roleData = await req.json();

    const existingRole = await Role.findOne({
      name: { $regex: new RegExp(`^${roleData.name}$`, 'i') } // Case-insensitive search
    });

    if (existingRole) {
      return NextResponse.json(
        {
          success: false,
          message: `A role with the name "${roleData.name}" already exists`
        },
        { status: 409 } // 409 Conflict status code
      );
    }

    const newRole = new Role(roleData);
    await newRole.save();

    return NextResponse.json(
      { success: true, message: "Role created" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
