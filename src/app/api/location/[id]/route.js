import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import location from '@/lib/models/location';

export async function GET({ params }) {
    const { id } = params;

    await dbConnect(); // Connect to your MongoDB database

    try {
        const findLocation = await location.findOne({ _id: id }).lean(); // Fetch officer by ID

        if (!findLocation) {
            return NextResponse.json({ message: 'Location not found' }, { status: 404 });
        }

        return NextResponse.json(findLocation); // Return the officer data
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching location' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = params;

    try {
        await dbConnect();
        const formData = await req.json();

        // First, get the current role to check if name is actually changing
        const currentLocation = await location.findById(id);

        if (!currentLocation) {
            return NextResponse.json(
                { success: false, message: 'Location not found' },
                { status: 404 }
            );
        }

        // Only check for duplicates if the name is actually being changed
        if (formData.name && formData.name.toLowerCase() !== currentLocation.name.toLowerCase()) {
            const existingLocation = await location.findOne({
                _id: { $ne: id }, // Exclude current role from search
                name: { $regex: new RegExp(`^${formData.name}$`, 'i') }
            });

            if (existingLocation) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `A location with the name "${formData.name}" already exists`
                    },
                    { status: 409 }
                );
            }
        }

        const updatedLocation = await location.findByIdAndUpdate(
            id,
            { $set: formData },
            { new: true }
        );

        return NextResponse.json(
            { success: true, data: updatedLocation },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message || 'Error updating location' },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    const { id } = params; // Get the office ID from the URL

    await dbConnect(); // Connect to MongoDB

    try {
        await location.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Location deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating location' }, { status: 500 });
    }
}