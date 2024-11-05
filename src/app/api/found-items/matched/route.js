import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import foundItem from "@/lib/models/found_items";
import LostItem from "@/lib/models/lost_items";

export async function GET() {
    try {
      await dbConnect();
  
      const fetchFoundItems = await foundItem.find({ matched: { $ne: null } })
          .populate({
              path: 'monitoredBy',
              populate: {
                  path: 'role', // This populates the role of the monitoredBy
                  model: 'Role', // Ensure this matches your role model name
              },
          })
          .populate('finder')
          .populate({
              path: 'matched',
              model: 'LostItem',
              populate: {
                  path: 'owner',
                  model: 'User',
              },
          });
  
      return NextResponse.json(fetchFoundItems, { status: 200 });
    } catch (error) {
      console.error("Error fetching found items:", error);
      return NextResponse.json(
        { error: "Failed to fetch found items" },
        { status: 500 }
      );
    }
  }