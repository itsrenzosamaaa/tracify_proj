import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import finder from "@/lib/models/finder";

export async function GET() {
  try {
    await dbConnect();

    const findFinders = await finder.find().populate('user')
      .populate({
        path: 'item',
        populate: {
          path: 'monitoredBy',
          populate: {
            path: 'role',
            model: 'Role',
          },
        },
      }
    );

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

    const newFinder = new finder(finderData);
    await newFinder.save();

    return NextResponse.json(
      { success: true, message: "Finder Created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST method:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}