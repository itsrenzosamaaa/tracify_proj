import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import finder from "@/lib/models/finder";
import item from "@/lib/models/item";
import user from "@/lib/models/user";

export async function GET(req, { params }) {
  const { userId } = params;
  try {
    await dbConnect();

    const findFoundItem = await finder
      .find({
        user: userId,
      })
      .populate("user")
      .populate("item");

    return NextResponse.json(findFoundItem, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
