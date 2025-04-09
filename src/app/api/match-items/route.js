import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import match_items from "@/lib/models/match_items";
import finder from "@/lib/models/finder";
import owner from "@/lib/models/owner";
import user from "@/lib/models/user";
import item from "@/lib/models/item";
import role from "@/lib/models/role";

export async function GET() {
  try {
    await dbConnect();

    const findMatchItems = await match_items
      .find()
      .populate({
        path: "finder",
        populate: [
          {
            path: "user",
            model: "User",
            populate: {
              path: "role",
              model: "Role", // or 'roles' based on your model name export
              select: "permissions",
            },
          },
          { path: "item", model: "Item" },
        ],
      })
      .populate({
        path: "owner",
        populate: [
          { path: "user", model: "User" },
        ],
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
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
