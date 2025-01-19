import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function PUT(req, { params }) {
    const { id } = params;

    try {
        const { birthday } = await req.json();

        if (!birthday) {
            return NextResponse.json(
                { error: "Birthday is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const updateBirthday = await User.findByIdAndUpdate(
            id,
            { $set: { birthday } },
            { new: true }
        );
        if (!updateBirthday) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Birthday updated successfully",
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating birthday:", error);
        return NextResponse.json(
            { error: "Failed to update birthday" },
            { status: 500 }
        );
    }
}