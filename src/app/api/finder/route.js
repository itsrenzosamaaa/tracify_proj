import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import finder from "@/lib/models/finder";
import item from "@/lib/models/item";
import user from "@/lib/models/user";
import roles from "@/lib/models/location";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    await dbConnect();

    const findFinders = await finder
      .find()
      .populate({
        path: "user",
        model: "User",
      })
      .populate({
        path: "item",
        model: "Item",
      });

    return NextResponse.json(findFinders, { status: 200 });
  } catch (error) {
    console.error("Error fetching finders:", error);
    return NextResponse.json(
      { error: "Failed to fetch finders" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const finderData = await req.json();

    finderData._id = `FD_${nanoid(6)}`;

    const newFinder = new finder(finderData);
    await newFinder.save();

    return NextResponse.json(
      newFinder,
      { success: true, message: "Finder Created" },
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
