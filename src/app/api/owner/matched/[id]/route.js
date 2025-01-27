import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import owner from "@/lib/models/owner";
import item from "@lib/models/item";
import user from "@lib/models/user";

export async function GET(req, { params }) {
    const { id } = params;
    try {
        await dbConnect();

        const findLostItem = await owner
            .findById(id)
            .populate('user')
            .populate('item')
            .lean();

        return NextResponse.json(findLostItem, { status: 200 });
    } catch (error) {
        console.error("Error fetching items:", error);
        return NextResponse.json(
            { error: "Failed to fetch items" },
            { status: 500 }
        );
    }
}