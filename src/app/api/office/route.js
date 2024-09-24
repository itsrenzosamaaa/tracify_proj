import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Office from "@/lib/models/office";

export async function GET() {
  try {
    await dbConnect();

    const findOffice = await Office.find();

    return NextResponse.json(findOffice, { status: 200 });
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
    const newOffice = new Office(formData);

    await newOffice.save();

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
