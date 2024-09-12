import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import accounts from "@/lib/models/accounts";

export async function GET() {
    try {
        await dbConnect();

        const findAccounts = await accounts.find();

        return NextResponse.json(findAccounts, { status: 200 });
    } catch (error) {
        console.error('Error fetching items:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}