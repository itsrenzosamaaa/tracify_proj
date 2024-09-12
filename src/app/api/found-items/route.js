import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import foundItems from "@/lib/models/foundItems";

export async function GET() {
    try {
        await dbConnect();

        const items = await foundItems.find();

        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        console.error('Error fetching items:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const name = formData.get('name');
        const category = formData.get('category');
        const description = formData.get('description');
        const location = formData.get('location');
        const date = formData.get('date');
        const time = formData.get('time');
        const finder = formData.get('finder');
        const status = formData.get('status');
        const image = formData.get('image');

        await dbConnect();

        const newItem = new foundItems({
            name,
            category,
            description,
            location,
            date,
            time,
            finder,
            status,
            image, // Handle image separately if needed
        });

        await newItem.save();

        return NextResponse.json({ message: 'Item added successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error adding item:', error);
        return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
    }
}