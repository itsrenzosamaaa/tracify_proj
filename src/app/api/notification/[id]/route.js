import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import notification from "@/lib/models/notification";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Filter notifications from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const findNotifications = await notification
      .find({
        receiver: id,
        dateNotified: { $gte: thirtyDaysAgo },
      })
      .sort({ dateNotified: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    return NextResponse.json(findNotifications, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
