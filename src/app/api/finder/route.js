import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import finder from "@/lib/models/finder";
import item from "@/lib/models/item";
import user from "@/lib/models/user";
import role from "@/lib/models/role";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    await dbConnect();

    const findFinders = await finder
      .find()
      .populate({
        path: "user",
        model: "User",
        populate: {
          path: "role",
          model: "Role", // or 'roles' based on your model name export
          select: "permissions",
        },
      })
      .populate({
        path: "item",
        model: "Item",
        populate: {
          path: "receivedBy",
          model: "User", // or 'roles' based on your model name export
          select: "firstname lastname",
        },
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
