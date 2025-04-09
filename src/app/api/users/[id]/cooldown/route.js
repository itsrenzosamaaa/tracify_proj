import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const { canUserReportLostItem } = await req.json();

    await dbConnect();

    const updateCooldown = await User.findByIdAndUpdate(
      id,
      { $set: { canUserReportLostItem } },
      { new: true }
    );
    if (!updateCooldown) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Cooldown updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cooldown:", error);
    return NextResponse.json(
      { error: "Failed to update cooldown" },
      { status: 500 }
    );
  }
}
