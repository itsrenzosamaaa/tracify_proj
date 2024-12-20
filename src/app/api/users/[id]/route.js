import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import user from "@/lib/models/user";
import badge from "@/lib/models/badge";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    await dbConnect();

    const findUser = await user.findOne({ _id: id }).lean();

    if (!findUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(findUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const body = await req.json();
    const { increment } = body;

    if (typeof increment !== 'string') {
      return NextResponse.json(
        { error: "increment must be a string value" },
        { status: 400 }
      );
    }

    await dbConnect();

    let updatedUser;
    if (increment === 'found-item') {
      updatedUser = await user.findOneAndUpdate(
        { _id: id },
        { $inc: { resolvedItemCount: increment ? 1 : 0 } },
        { new: true }
      );
    } else {
      updatedUser = await user.findOneAndUpdate(
        { _id: id },
        { $inc: { ratingsCount: increment ? 1 : 0 } },
        { new: true }
      );
    }

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(updatedUser)

    return NextResponse.json({ updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Error updating resolved items count:", error);
    return NextResponse.json(
      { error: "Failed to increment resolved items count" },
      { status: 500 }
    );
  }
}