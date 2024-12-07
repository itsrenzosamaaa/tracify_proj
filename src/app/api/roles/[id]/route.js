import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import roles from '@/lib/models/roles';

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

// export async function PUT(req, { params }) {
//     const { id } = params; // Get the office ID from the URL

//     await dbConnect(); // Connect to MongoDB

//     try {
//         const formData = await req.json();
//         const updatedUser = await users.findOneAndUpdate(
//             { accountId : id },
//             { $set: formData },
//             { new: true }
//         );

//         console.log('Updated User: ', updatedUser)

//         if (!updatedUser) {
//             return NextResponse.json({ message: 'User not found' }, { status: 404 });
//         }

//         return NextResponse.json(updatedUser);
//     } catch (error) {
//         return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
//     }
// }