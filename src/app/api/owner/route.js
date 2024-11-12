import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import owner from "@/lib/models/owner";

export async function GET() {
    try {
      await dbConnect();
  
      const findOwners = await owner.find().populate('user').populate('item');

      console.log(findOwners)

      return NextResponse.json(findOwners, { status: 200 });
    } catch (error) {
      console.error("Error fetching owners:", error);
      return NextResponse.json(
        { error: "Failed to fetch owners" },
        { status: 500 }
      );
    }
}

export async function POST(req) {
    try {
      await dbConnect();
      const ownerData = await req.json();
  
      const newOwner = new owner(ownerData);
      await newOwner.save();
  
      return NextResponse.json(
        { success: true, message: "Owner Created" },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error in POST method:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }