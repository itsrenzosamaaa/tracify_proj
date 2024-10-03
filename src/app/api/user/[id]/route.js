import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import users from '@/lib/models/user';

export async function GET(req, { params }) {
    const { id } = params;

    await dbConnect(); // Connect to your MongoDB database

    try {
        const user = await users.findOne({ accountId : id }).lean(); // Fetch officer by ID

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user); // Return the officer data
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching user' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = params; // Get the office ID from the URL

    await dbConnect(); // Connect to MongoDB

    try {
        const formData = await req.json();
        const updatedUser = await users.findOneAndUpdate(
            { accountId : id },
            { $set: formData },
            { new: true }
        );  

        console.log('Updated User: ', updatedUser)

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
    }
}