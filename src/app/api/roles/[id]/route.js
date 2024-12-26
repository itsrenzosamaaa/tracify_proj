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
    const { id } = params;

    try {
        await dbConnect();
        const formData = await req.json();

        // First, get the current role to check if name is actually changing
        const currentRole = await roles.findById(id);

        if (!currentRole) {
            return NextResponse.json(
                { success: false, message: 'Role not found' },
                { status: 404 }
            );
        }

        // Only check for duplicates if the name is actually being changed
        if (formData.name && formData.name.toLowerCase() !== currentRole.name.toLowerCase()) {
            const existingRole = await roles.findOne({
                _id: { $ne: id }, // Exclude current role from search
                name: { $regex: new RegExp(`^${formData.name}$`, 'i') }
            });

            if (existingRole) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `A role with the name "${formData.name}" already exists`
                    },
                    { status: 409 }
                );
            }
        }

        const updatedRole = await roles.findByIdAndUpdate(
            id,
            { $set: formData },
            { new: true }
        );

        return NextResponse.json(
            { success: true, data: updatedRole },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message || 'Error updating role' },
            { status: 500 }
        );
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