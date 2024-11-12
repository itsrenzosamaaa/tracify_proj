import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ratings from '@/lib/models/ratings';
import found_items from '@/lib/models/item';
import lost_items from '@/lib/models/match_items';

export async function GET(req, { params }) {
    const { userId } = params;

    await dbConnect();

    try {
        // Fetch ratings for the receiver userId
        const findReceiver = await ratings.find({ receiver: userId })
            .populate("sender")
            .populate("item")
            .lean();

        if (!findReceiver || findReceiver.length === 0) {
            return NextResponse.json({ message: 'No ratings found for this user' }, { status: 404 });
        }

        return NextResponse.json(findReceiver);
    } catch (error) {
        console.error('Error fetching sender:', error);
        return NextResponse.json({ message: 'Error fetching ratings', error: error.message }, { status: 500 });
    }
}
