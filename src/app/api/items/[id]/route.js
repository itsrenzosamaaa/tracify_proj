import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import found_items from '@/lib/models/found_items';
import lost_items from '@/lib/models/lost_items';

export async function GET(request, { params }) {
    const { id } = params;

    await dbConnect(); // Connect to your MongoDB database

    try {
        const foundItems = await found_items.find({ finder : id }); // Fetch officer by ID
        const lostItems =  await lost_items.find({ owner : id });

        if (!foundItems.length && !lostItems.length) {
            return NextResponse.json({ message: 'No items found' }, { status: 404 });
        }

        const combinedItems = [...foundItems, ...lostItems];

        return NextResponse.json(combinedItems); // Return the officer data
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching items' }, { status: 500 });
    }
}