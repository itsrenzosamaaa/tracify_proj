import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import notification from "@/lib/models/notification";

export async function POST(req) {
  try {
    await dbConnect();
    const notificationData = await req.json();

    if (!Array.isArray(notificationData)) {
      return NextResponse.json(
        { success: false, message: "Invalid data format. Expected an array." },
        { status: 400 }
      );
    }

    await notification.insertMany(notificationData, { ordered: false });

    return NextResponse.json(
      { success: true, message: "Notifications sent." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST method:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
