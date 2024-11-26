import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import notification from "@/lib/models/notification";

export async function POST(req) {
  try {
    await dbConnect();
    const notificationData = await req.json();

    const newNotification = new notification(notificationData);
    await newNotification.save();

    return NextResponse.json(
      { success: true, message: "Notification sent" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST method:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}