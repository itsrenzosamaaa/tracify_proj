import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user"; // Capitalized model import for convention

export async function PUT(req, { params }) {
    const { id } = params; // Get userId from URL params
    const { badgeId } = await req.json(); // Extract badgeId from the request body

    try {
        await dbConnect(); // Connect to the database

        // Find the user by their userId
        const selectedBadgeUser = await User.findById(id);

        if (!selectedBadgeUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update the selectedBadge field with the selected badgeId
        selectedBadgeUser.selectedBadge = badgeId;
        await selectedBadgeUser.save(); // Save the updated user document

        return NextResponse.json({ message: "Selected badge updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating selected badge:", error);
        return NextResponse.json({ error: "Failed to update badge" }, { status: 500 });
    }
}