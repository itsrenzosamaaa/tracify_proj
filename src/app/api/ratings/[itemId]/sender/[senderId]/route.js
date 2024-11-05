import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ratings from '@/lib/models/ratings';
import found_items from '@/lib/models/found_items';
import lost_items from '@/lib/models/lost_items';

export async function GET(req, { params }) {
    const { itemId, senderId } = params;

    await dbConnect();

    try {
        const findSender = await ratings.findOne({
            item: itemId,
            sender: senderId
        })
            .populate("sender")
            .populate("receiver")
            .lean();

        if (!findSender) {
            return NextResponse.json({ message: 'Sender not found' }, { status: 404 });
        }

        let item;
        if (findSender.isFoundItem) {
            item = await found_items.findById(findSender.item).lean();
        } else {
            item = await lost_items.findById(findSender.item).lean();
        }

        if (!item) {
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        findSender.item = item;
        return NextResponse.json(findSender);
    } catch (error) {
        console.error('Error fetching sender:', error);
        return NextResponse.json({ message: 'Error fetching sender' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { itemId, senderId } = params;

    await dbConnect();

    try {
        const { rating } = await req.json();

        if (!rating) {
            return NextResponse.json({ message: 'Rating data is required' }, { status: 400 });
        }

        const updatedRating = await ratings.findOneAndUpdate(
            { item: itemId, sender: senderId },
            { $set: rating },
            { new: true }
        );

        if (!updatedRating) {
            return NextResponse.json({ message: 'Rating not found' }, { status: 404 });
        }

        return NextResponse.json(updatedRating);
    } catch (error) {
        console.error('Error updating rating:', error);
        return NextResponse.json({ message: 'Error updating rating' }, { status: 500 });
    }
}
