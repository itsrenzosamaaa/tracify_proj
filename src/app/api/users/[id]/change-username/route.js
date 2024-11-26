import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function PUT(req, { params }) {
    const { id } = params;

    try {
        const { username } = await req.json();

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const updateUsername = await User.findByIdAndUpdate(
            id,
            { $set: { username } },
            { new: true }
        );
        if (!updateUsername) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Username updated successfully",
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating username:", error);
        return NextResponse.json(
            { error: "Failed to update username" },
            { status: 500 }
        );
    }
}