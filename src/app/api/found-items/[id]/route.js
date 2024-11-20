import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import item from "@/lib/models/item";
import admin from "@/lib/models/admin";
import Role from "@/lib/models/roles";

export async function GET(req, { params }) {
    const { id } = params;
    try {
        await dbConnect();

        const findFoundItem = await item.findOne({ _id: id, isFoundItem: true })
            .populate({
                path: 'monitoredBy',
                populate: {
                    path: 'role',
                    model: 'Role',
                }
            });

        return NextResponse.json(findFoundItem, { status: 200 });
    } catch (error) {
        console.error("Error fetching items:", error);
        return NextResponse.json(
            { error: "Failed to fetch items" },
            { status: 500 }
        );
    }
}

export async function PUT(req, { params }) {
    const { id } = params; // Get the office ID from the URL
    const { status, ...fields } = await req.json();

    await dbConnect(); // Connect to MongoDB

    try {
        const updateData = { status, ...fields };
        if (status === 'Request') {
            updateData.dateRequest = new Date();
        } else if (status === 'Surrender Pending') {
            updateData.dateValidating = new Date();
        } else if (status === 'Published') {
            updateData.datePublished = new Date();
        } else if (status === 'Matched') {
            updateData.dateMatched = new Date();
        } else if (status === 'Decline Retrieval') {
            updateData.dateMatched = null;
            updateData.status = 'Published';
        } else if (status === 'Resolved') {
            updateData.dateResolved = new Date();
        } else if (status === 'Declined') {
            updateData.dateDeclined = new Date();
        } else if (status === 'Canceled') {
            updateData.dateCanceled = new Date();
        }

        const updatedFoundItem = await item.findOneAndUpdate(
            { _id: id },
            { $set: updateData },
            { new: true }
        );

        if (!updatedFoundItem) {
            return NextResponse.json({ message: 'Found item not found' }, { status: 404 });
        }

        return NextResponse.json(updatedFoundItem);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating found item' }, { status: 500 });
    }
}