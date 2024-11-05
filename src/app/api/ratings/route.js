import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ratings from "@/lib/models/ratings";

export async function GET() {
    try {
      await dbConnect();
  
      const findRatings = await ratings.find().populate("sender").populate("receiver").populate({
        path: 'item',
        model: 'FoundItem',
        populate: {
            path: 'matched',
            model: 'LostItem',
        },
      });

      return NextResponse.json(findRatings, { status: 200 });
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return NextResponse.json(
        { error: "Failed to fetch ratings" },
        { status: 500 }
      );
    }
}

export async function POST(req) {
    await dbConnect();
  
    try {
      const addRate = await req.json();
  
      const newRating = new ratings(addRate);
  
      const savedAdmin = await newRating.save();
      return NextResponse.json(
        { success: true, message: "Account created" },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating account:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
  }