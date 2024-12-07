import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import match_items from "@/lib/models/match_items";
import finder from "@/lib/models/finder";
import owner from "@/lib/models/owner";
import user from "@/lib/models/user";
import item from "@/lib/models/item";
import admin from "@/lib/models/admin";
import roles from "@/lib/models/roles";

export async function GET() {
  try {
    await dbConnect();

    const findMatchItems = await match_items.find()
      .populate({
        path: 'finder',
        populate: [
          { path: 'user', model: 'User' },
          { path: 'item', model: 'Item', populate: { path: 'monitoredBy', populate: 'role' } }
        ]
      })
      .populate({
        path: 'owner',
        populate: [
          { path: 'user', model: 'User' },
          { path: 'item', model: 'Item' }
        ]
      });

    return NextResponse.json(findMatchItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching match items:", error);
    return NextResponse.json(
      { error: "Failed to fetch match items" },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    await dbConnect();
    const matchedData = await req.json();

    const newMatch = new match_items(matchedData);
    await newMatch.save();

    return NextResponse.json(
      { success: true, message: "Match Created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST method:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}