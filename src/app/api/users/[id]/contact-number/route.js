import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function PUT(req, { params }) {
    const { id } = params;

    try {
        const { contactNumber } = await req.json();

        if (!contactNumber) {
            return NextResponse.json(
                { error: "Contact Number is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const updateContactNumber = await User.findByIdAndUpdate(
            id,
            { $set: { contactNumber } },
            { new: true }
        );
        if (!updateContactNumber) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Contact Number updated successfully",
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating contact number:", error);
        return NextResponse.json(
            { error: "Failed to update contact number" },
            { status: 500 }
        );
    }
}