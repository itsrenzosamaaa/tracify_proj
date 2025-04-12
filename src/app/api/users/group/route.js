export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import user from "@/lib/models/user";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const value = searchParams.get("value");

    if (!type || !value) {
      return NextResponse.json(
        { error: "Missing type or value query parameters" },
        { status: 400 }
      );
    }

    const users = await user.find({ [`studentProfile.${type}`]: value });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
