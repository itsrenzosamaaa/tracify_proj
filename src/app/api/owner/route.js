import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import owner from "@/lib/models/owner";
import user from "@/lib/models/user";
import item from "@/lib/models/item";
import { nanoid } from "nanoid";

export async function GET() {
    try {
      await dbConnect();
  
      const findOwners = await owner.find().populate('user').populate('item');

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

      ownerData._id =  `OW_${nanoid(6)}`;
  
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