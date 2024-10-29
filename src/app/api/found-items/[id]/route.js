import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import found_items from '@/lib/models/found_items';

export async function GET(req, { params }) {
    const { id } = params;

    await dbConnect(); // Connect to your MongoDB database

    try {
        const findFoundItem = await found_items({ _id: id })
            .populate({
                path: 'monitoredBy',
                populate: {
                    path: 'role', // This populates the role of the monitoredBy
                    model: 'Role', // Ensure this matches your role model name
                },
            })
            .populate('finder') // Populate finder if necessary
            .lean(); // Convert to plain JavaScript object

        if (!findFoundItem) {
            return NextResponse.json({ message: 'Lost item not found' }, { status: 404 });
        }

        return NextResponse.json(findFoundItem); // Return the officer data
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching lost item' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = params; // Get the office ID from the URL
    const { status, ...fields } = await req.json();

    await dbConnect(); // Connect to MongoDB

    try {
        const updateData = { status, ...fields };
        if(status === 'Request'){
            updateData.dateRequest = new Date();
        }else if (status === 'Validating'){
            updateData.dateValidating = new Date();
        }else if (status === 'Published'){
            updateData.datePublished = new Date();
        }else if (status === 'Claimed'){
            updateData.dateClaimed = new Date();
        }else if (status === 'Invalid'){
            updateData.dateInvalid = new Date();
        }

        const updatedFoundItem = await found_items.findOneAndUpdate(
            { _id : id },
            { $set: updateData },
            { new: true }
        );  

        console.log('Updated Lost Item: ', updatedFoundItem)

        if (!updatedFoundItem) {
            return NextResponse.json({ message: 'Lost item not found' }, { status: 404 });
        }

        return NextResponse.json(updatedFoundItem);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating lost item' }, { status: 500 });
    }
}