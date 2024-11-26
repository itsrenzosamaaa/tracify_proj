import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import notification from "@/lib/models/notification";

export async function GET(req, { params }) {
    const { id } = params;
    try {
        await dbConnect();

        const findNotifications = await notification.find({ receiver: id });

        return NextResponse.json(findNotifications, { status: 200 });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}