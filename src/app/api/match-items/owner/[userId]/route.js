import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import match_items from "@/lib/models/match_items";
import finder from "@/lib/models/finder";
import owner from "@/lib/models/owner";
import item from "@/lib/models/item";
import user from "@/lib/models/user";

export async function GET(req, { params }) {
  const { userId } = params; // you're destructuring correctly here

  try {
    await dbConnect();

    const findMatchItems = await match_items
      .find({ "owner.user": userId }) // 🔧 Fix: use userId instead of id
      .sort({ datePending: -1 })
      .populate({
        path: "finder",
        populate: [
          { path: "user", model: "User" },
          { path: "item", model: "Item" },
        ],
      })
      .populate({
        path: "owner",
        populate: [{ path: "user", model: "User" }],
      })
      .lean();

    return NextResponse.json(findMatchItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching match items:", error);
    return NextResponse.json(
      { error: "Failed to fetch match items" },
      { status: 500 }
    );
  }
}
