import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import office from '@/lib/models/office';

export async function GET(req, { params }) {
    const { id } = params;

    await dbConnect(); // Connect to your MongoDB database

    try {
        const officer = await office.findOne({ accountId: id }).lean(); // Fetch officer by ID

        console.log(officer)

        if (!officer) {
            return NextResponse.json({ message: 'Officer not found' }, { status: 404 });
        }

        return NextResponse.json(officer); // Return the officer data
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching officer' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = params; // Get the office ID from the URL

    await dbConnect(); // Connect to MongoDB

    try {
        const formData = await req.json();
        const updatedOffice = await office.findOneAndUpdate(
            { accountId: id },
            { $set: formData },
            { new: true }
        );  

        console.log('Updated Office: ', updatedOffice)

        if (!updatedOffice) {
            return NextResponse.json({ message: 'Office not found' }, { status: 404 });
        }

        return NextResponse.json(updatedOffice);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating office' }, { status: 500 });
    }
}