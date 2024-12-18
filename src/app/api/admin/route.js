import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import admin from "@/lib/models/admin";
import roles from "@/lib/models/roles";
import bcrypt from 'bcryptjs';

export async function GET(req) {
  try {
    await dbConnect();

    const findAdmin = await admin.find().populate("role");

    return NextResponse.json(findAdmin, { status: 200 });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    await dbConnect();

    const processedData = await Promise.all(
      data.map(async (admin) => {
        admin.role = null;
        admin.date_created = Date.now();

        if (admin.password) {
          const saltRounds = 10;
          admin.password = await bcrypt.hash(admin.password, saltRounds);
        }

        return admin;
      })
    );

    const insertedAdmin = await admin.insertMany(processedData, { ordered: false });

    return NextResponse.json(
      { message: "Admins imported successfully!", count: insertedAdmin.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error importing admins:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: "Validation error in some records." }, { status: 400 });
    } else if (error.code === 11000) {
      return NextResponse.json({ error: "Some records already exist." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to import admins." }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account"); // Extract accountId from query params

  if (!accountId) {
    return NextResponse.json(
      { success: false, message: "Account ID is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Delete the admin by accountId
    const deletedAdmin = await admin.findByIdAndDelete(accountId);

    if (!deletedAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting admin", error: error.message },
      { status: 500 }
    );
  }
}
