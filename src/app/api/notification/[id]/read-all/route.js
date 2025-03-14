// route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import notification from "@/lib/models/notification";

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    await dbConnect();

    const updateResult = await notification.updateMany(
      { receiver: id },
      { $set: { markAsRead: true } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ message: "No notifications updated" });
    }

    return NextResponse.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
