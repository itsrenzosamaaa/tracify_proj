import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import student from "@/lib/models/student";

export async function GET(req, { params }) {
  const { id } = params;
  try {
    await dbConnect();

    const findStudent = await student.findOne({ _id: id }).populate("account").lean();

    if (!findStudent) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(findStudent, { status: 200 });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}
