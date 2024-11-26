import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import notification from "@/lib/models/notification";

export async function PUT(req, { params }) {
    const { id } = params; // Get the user ID from the URL
    const { markAsRead } = await req.json(); // Extract the markAsRead field from the request body

    // Ensure markAsRead is a boolean
    if (typeof markAsRead !== 'boolean') {
        return NextResponse.json({ message: 'Invalid value for markAsRead' }, { status: 400 });
    }

    await dbConnect(); // Connect to MongoDB

    try {
        // Update all notifications for the given receiver and mark them as read
        const updateRead = await notification.updateMany(
            { receiver: id }, // Find all notifications for the receiver
            { $set: { markAsRead: true } }, // Set markAsRead to true
            { new: true } // This will return the updated documents, but updateMany doesn't return them
        );

        if (updateRead.modifiedCount === 0) {
            return NextResponse.json({ message: 'No notifications updated' }, { status: 200 });
        }

        return NextResponse.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error("Error in PUT method:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
