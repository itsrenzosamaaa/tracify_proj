import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ratings from '@/lib/models/ratings';
import found_items from '@/lib/models/found_items';
import lost_items from '@/lib/models/lost_items';

export async function GET(req, { params }) {
    const { userId } = params;

    await dbConnect();

    try {
        // Fetch ratings for the receiver userId
        const findSender = await ratings.find({ receiver: userId })
            .populate("sender")
            .lean();

        if (!findSender || findSender.length === 0) {
            return NextResponse.json({ message: 'No ratings found for this user' }, { status: 404 });
        }

        // Iterate through the ratings and fetch associated items
        const enrichedRatings = await Promise.all(findSender.map(async (rating) => {
            let item;

            // Validate the item ID before querying
            if (rating.item) {
                if (rating.isFoundItem) {
                    item = await found_items.findById(rating.item).lean();
                } else {
                    item = await lost_items.findById(rating.item).lean();
                }
            }

            return {
                ...rating,
                item: item || null, // Return null if item is not found
            };
        }));

        return NextResponse.json(enrichedRatings);
    } catch (error) {
        console.error('Error fetching sender:', error);
        return NextResponse.json({ message: 'Error fetching ratings', error: error.message }, { status: 500 });
    }
}
