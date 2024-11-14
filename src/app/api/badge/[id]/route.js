import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import badge from '@/lib/models/badge';

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
        const updatedBadge = await badge.findOneAndUpdate(
            { _id : id },
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
        const deletedBadge = await badge.findByIdAndDelete({ _id: id });

        if (!deletedBadge) {
            return NextResponse.json({ message: 'Badge not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Badge deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}