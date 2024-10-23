import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import student from "@/lib/models/student";

export async function GET() {
  try {
    await dbConnect();

    const findStudent = await student.find().populate("account");

    return NextResponse.json(findStudent, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();

  try {
    const studentFormData = await req.json();

    const newStudent = new student(studentFormData);

    const savedStudent = await newStudent.save();
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

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get("account"); // Extract accountId from query params

  try {
    await dbConnect();

    // Delete the admin by accountId
    const deletedStudent = await student.findOneAndDelete({ account });

    if (!deletedStudent) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting student", error: error.message },
      { status: 500 }
    );
  }
}
