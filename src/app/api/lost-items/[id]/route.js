import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import item from "@/lib/models/item";

export async function GET(req, { params }) {
  const { id } = params;
  try {
    await dbConnect();

    const findLostItem = await item
      .findById({ _id: id, isFoundItem: false })
      .lean();

    return NextResponse.json(findLostItem, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const { status, ...fields } = await req.json();

  await dbConnect();

  try {
    const updateData = { status, ...fields };
    if (status === "Request") {
      updateData.dateRequest = new Date();
    } else if (status === "Missing") {
      updateData.dateMissing = new Date();
    } else if (status === "Claimed") {
      updateData.dateClaimed = new Date();
    } else if (status === "Terminated") {
      updateData.dateTerminated = new Date();
    } else if (status === "Declined") {
      updateData.dateDeclined = new Date();
    } else if (status === "Canceled") {
      updateData.dateCanceled = new Date();
    }

    const updateLostItem = await item.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );

    if (!updateLostItem) {
      return NextResponse.json(
        { message: "Lost item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updateLostItem);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating lost item" },
      { status: 500 }
    );
  }
}
