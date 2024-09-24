import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function GET() {
  try {
    await dbConnect();

    const findUser = await User.find();

    return NextResponse.json(findUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();

  try {
    const formData = await req.json();
    const newUser = new User(formData);

    await newUser.save();

    console.log("User created successfully");

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
