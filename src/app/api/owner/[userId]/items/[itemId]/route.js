import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import owner from "@/lib/models/owner";

export async function GET(req, { params }) {
    const { userId, itemId } = params;
    try {
      await dbConnect();
  
      const findLostItem = await owner.findOne({
        user: userId,
        item: itemId,
      })
      .populate('user')
      .populate('item');

      return NextResponse.json(findLostItem, { status: 200 });
    } catch (error) {
      console.error("Error fetching items:", error);
      return NextResponse.json(
        { error: "Failed to fetch items" },
        { status: 500 }
      );
    }
}