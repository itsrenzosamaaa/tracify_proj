import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import admin from '@/lib/models/admin';

export async function GET({ params }) {
    const { id } = params;

    await dbConnect(); // Connect to your MongoDB database

    try {
        const findUser = await admin.findOne({ _id: id }).populate("role").lean(); // Fetch officer by ID

        if (!findUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(findUser); // Return the officer data
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching user' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = params;

    try {
        const { role } = await req.json();

        if (!role) {
            return NextResponse.json(
                { error: "Role is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const setRole = await admin.findByIdAndUpdate(
            id,
            { $set: { role } },
            { new: true }
        );
        if (!setRole) {
            return NextResponse.json(
                { error: "Admin not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Admin updated successfully",
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating admin:", error);
        return NextResponse.json(
            { error: "Failed to update admin" },
            { status: 500 }
        );
    }
}