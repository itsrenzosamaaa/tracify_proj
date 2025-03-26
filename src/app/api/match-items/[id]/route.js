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
                    { path: 'item', model: 'Item' }
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
    const { id } = params;
    const { request_status, ...fields } = await req.json();

    await dbConnect();

    try {
        const updateData = { request_status, ...fields };
        if (request_status === 'Approved') {
            updateData.dateApproved = new Date();
        } else if (request_status === 'Completed') {
            updateData.dateCompleted = new Date();
        } else if (request_status === 'Canceled') {
            updateData.dateCanceled = new Date();
        } else if (request_status === 'Declined') {
            updateData.dateDeclined = new Date();
        }

        const updateMatchedData = await match_items.findOneAndUpdate(
            { _id: id },
            { $set: updateData },
            { new: true }
        );

        if (!updateMatchedData) {
            return NextResponse.json({ message: 'Matched items not found' }, { status: 404 });
        }

        return NextResponse.json(updateMatchedData);
    } catch (error) {
        console.error("Error in POST method:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}