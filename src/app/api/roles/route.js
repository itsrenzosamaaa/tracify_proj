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

    const newRole = new Role(roleData);
    await newRole.save();

    console.log(newRole);

    return NextResponse.json(
      { success: true, message: "Role created" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
