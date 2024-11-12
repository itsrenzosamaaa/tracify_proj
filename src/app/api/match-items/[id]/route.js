import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import match_items from "@/lib/models/match_items";

export async function GET(req, { params }) {
    const { id } = params;
    try {
        await dbConnect();

        const findMatchItems = await match_items.findOne({ _id: id })
            .populate({
                path: 'finder',
                populate: [
                    { path: 'user', model: 'User' },
                    { path: 'item', model: 'Item', populate: { path: 'monitoredBy', populate: 'role' } }
                ]
            })
            .populate({
                path: 'owner',
                populate: [
                    { path: 'user', model: 'User' },
                    { path: 'item', model: 'Item' }
                ]
            });

        return NextResponse.json(findMatchItems, { status: 200 });
    } catch (error) {
        console.error("Error fetching match items:", error);
        return NextResponse.json(
            { error: "Failed to fetch match items" },
            { status: 500 }
        );
    }
}


export async function PUT(req, { params }) {
    const { id } = params; // Get the office ID from the URL
    const { status } = await req.json();

    await dbConnect(); // Connect to MongoDB

    try {
        const updateData = { status };
        if (status === 'To Be Claim') {
            updateData.dateToBeClaim = new Date();
        } else if (status === 'Claimed') {
            updateData.dateClaimed = new Date();
        } else if (status === 'Canceled') {
            updateData.dateCanceled = new Date();
        } else if (status === 'Decline') {
            updateData.dateDecline = new Date();
        }

        const updateMatchedData = await match_items.findOneAndUpdate(
            { _id: id },
            { $set: updateData },
            { new: true }
        );

        if (!updateMatchedData) {
            return NextResponse.json({ message: 'Found item not found' }, { status: 404 });
        }

        return NextResponse.json(updateMatchedData);
    } catch (error) {
        console.error("Error in POST method:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}