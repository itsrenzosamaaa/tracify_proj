import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import lost_items from '@/lib/models/lost_items';

export async function GET(req, { params }) {
    const { id } = params;

    await dbConnect(); // Connect to your MongoDB database

    try {
        const findLostItem = await lost_items.findOne({ _id : id }).populate('owner').lean(); // Fetch officer by ID

        if (!findLostItem) {
            return NextResponse.json({ message: 'Lost item not found' }, { status: 404 });
        }

        return NextResponse.json(findLostItem); // Return the officer data
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching lost item' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = params; // Get the office ID from the URL
    const { status } = await req.json();

    await dbConnect(); // Connect to MongoDB

    try {
        const updateData = { status };
        if(status === 'Request'){
            updateData.dateRequest = new Date();
        }else if (status === 'Missing'){
            updateData.dateMissing = new Date();
        }else if (status === 'Tracked'){
            updateData.dateTracked = new Date();
        }else if (status === 'Claimed'){
            updateData.dateClaimed = new Date();
        }else if (status === 'Invalid'){
            updateData.dateInvalid = new Date();
        }else if (status === 'Canceled'){
            updateData.dateCanceled = new Date();
        }

        const updatedLostItem = await lost_items.findOneAndUpdate(
            { _id : id },
            { $set: updateData },
            { new: true }
        );  

        console.log('Updated Lost Item: ', updatedLostItem)

        if (!updatedLostItem) {
            return NextResponse.json({ message: 'Lost item not found' }, { status: 404 });
        }

        return NextResponse.json(updatedLostItem);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating lost item' }, { status: 500 });
    }
}