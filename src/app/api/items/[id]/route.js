import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import finder from '@/lib/models/finder';
import owner from '@/lib/models/owner';
import item from '@/lib/models/item';

export async function GET(request, { params }) {
    const { id } = params;

    // Connect to the database
    await dbConnect();

    try {
        // Fetch found items and lost items with user and item populated
        const foundItems = await finder.find({ user: id })
            .populate('user')
            .populate('item');

        const lostItems = await owner.find({ user: id })
            .populate('user')
            .populate('item');

        // Combine found and lost items
        const combinedItems = [...foundItems, ...lostItems];

        // Return combined items in JSON format
        return NextResponse.json(combinedItems);
    } catch (error) {
        console.error("Error fetching items:", error);
        return NextResponse.json({ message: 'Error fetching items' }, { status: 500 });
    }
}
