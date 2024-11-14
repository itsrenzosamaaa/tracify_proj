import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import badge from '@/lib/models/badge';

export async function GET() {
    await dbConnect(); // Connect to your MongoDB database

    try {
        const findBadges = await badge.find({ condition: 'Rating/s' }).lean(); // Fetch officer by ID

        if (!findBadges) {
            return NextResponse.json({ message: 'Badges not found' }, { status: 404 });
        }

        return NextResponse.json(findBadges); // Return the officer data
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching badges' }, { status: 500 });
    }
}