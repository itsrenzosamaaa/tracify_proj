import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import badge from "@/lib/models/badge";

export async function GET() {
  try {
    await dbConnect();

    const findBadges = await badge.find();

    return NextResponse.json(findBadges, { status: 200 });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();

  try {
    const badgeFormData = await req.json();

    const newBadge = new badge(badgeFormData);

    await newBadge.save();
    return NextResponse.json(
      { success: true, message: "Badge created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating badge:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get("account"); // Extract accountId from query params

  try {
    await dbConnect();

    // Delete the admin by accountId
    const deletedAdmin = await admin.findOneAndDelete({ account });

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
