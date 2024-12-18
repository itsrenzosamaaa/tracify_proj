import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import roles from '@/lib/models/roles';
import admin from '@/lib/models/admin';

export async function GET({ params }) {
    const { id } = params;

    await dbConnect(); // Connect to your MongoDB database

    try {
        const findRole = await roles.findOne({ _id: id }).lean(); // Fetch officer by ID

        if (!findRole) {
            return NextResponse.json({ message: 'Role not found' }, { status: 404 });
        }

        return NextResponse.json(findRole); // Return the officer data
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching role' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = params; // Get the office ID from the URL

    await dbConnect(); // Connect to MongoDB

    try {
        const formData = await req.json();
        const updatedRole = await roles.findByIdAndUpdate(
            id,
            { $set: formData },
            { new: true }
        );

        if (!updatedRole) {
            return NextResponse.json({ message: 'Role not found' }, { status: 404 });
        }

        return NextResponse.json(updatedRole);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating role' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = params; // Get the office ID from the URL

    await dbConnect(); // Connect to MongoDB

    try {
        const adminsAssigned = await admin.find({ role: id });
        if (adminsAssigned.length > 0) {
            return NextResponse.json({ message: 'Role is still assigned to admin users and cannot be deleted.' }, { status: 400 });
        }

        await roles.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Role deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating role' }, { status: 500 });
    }
}