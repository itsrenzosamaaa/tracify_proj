import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import role from "@/lib/models/role";

export async function GET() {
  try {
    await dbConnect();

    const findRoles = await role.find();

    return NextResponse.json(findRoles, { status: 200 });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const roleData = await req.json();

    const newRole = new role(roleData);
    await newRole.save();

    return NextResponse.json(
      newRole,
      { success: true, message: "Role created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in adding role:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
