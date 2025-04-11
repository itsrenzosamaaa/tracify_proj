import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import match_items from "@/lib/models/match_items";

export async function PUT(req, { params }) {
  const { finderId } = params;
  const { request_status, ...fields } = await req.json();

  await dbConnect();

  try {
    const updateData = { request_status, ...fields };
    if (request_status === "Declined") {
      updateData.dateDeclined = now;
    }

    // ✅ Only update matched items with status "Pending" or "Approved"
    const result = await match_items.updateMany(
      {
        finder: finderId,
        request_status: { $in: ["Pending", "Approved"] },
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "No matched items with Pending or Approved status found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `${result.modifiedCount} matched item(s) updated.`,
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating match items:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
