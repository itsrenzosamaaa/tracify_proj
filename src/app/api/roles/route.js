import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Role from "@/lib/models/roles";
import { getToken } from "next-auth/jwt";

// GET: Fetch all roles or a specific role based on query parameters
export async function GET(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.userType === 'user') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
