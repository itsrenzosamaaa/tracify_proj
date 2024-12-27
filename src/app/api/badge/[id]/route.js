import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import badge from '@/lib/models/badge';
import user from '@/lib/models/user';

export async function GET({ params }) {
    const { id } = params;

    await dbConnect(); // Connect to your MongoDB database

    try {
        const findBadge = await badge.findOne({ _id: id }).lean(); // Fetch officer by ID

        if (!findBadge) {
            return NextResponse.json({ message: 'Badge not found' }, { status: 404 });
        }

        return NextResponse.json(findBadge); // Return the officer data
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching badge' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = params; // Get the office ID from the URL

    await dbConnect(); // Connect to MongoDB

    try {
        const formData = await req.json();
        const updatedBadge = await badge.findByIdAndUpdate(
            id,
            { $set: formData },
            { new: true }
        );

        if (!updatedBadge) {
            return NextResponse.json({ message: 'Badge not found' }, { status: 404 });
        }

        return NextResponse.json(updatedBadge);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating badge' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = params;

    await dbConnect();

    try {
        const badgeToDelete = await badge.findById(id);
        if (!badgeToDelete) {
            return NextResponse.json({ message: 'Badge not found' }, { status: 404 });
        }

        // Remove the badge from all users who have it
        const usersUpdated = await user.updateMany(
            { badges: id }, // Find users with this badge
            { $pull: { badges: id } } // Remove the badge from the array
        );

        // Delete the badge
        await badge.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Badge deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}