import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import user from "@/lib/models/user";
import badge from "@/lib/models/badge";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    await dbConnect();

    const findUser = await user.findOne({ _id: id }).lean();

    if (!findUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(findUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const updatedFormData = await req.json();

    await dbConnect();

    const emailRegex = /^[a-z]+@thelewiscollege\.edu\.ph$/;

    const isValidEmail = emailRegex.test(updatedFormData.emailAddress);

    if (!isValidEmail) {
      return NextResponse.json(
        {
          message:
            "Invalid email address. Please ensure the email uses lowercase letters only and ends with @thelewiscollege.edu.ph.",
        },
        { status: 400 } // Status 400 indicates a bad request
      );
    }

    const existingUsers = await user.find({
      $or: [
        {
          firstname: {
            $regex: `^${updatedFormData.firstname}$`,
            $options: "i",
          },
          lastname: { $regex: `^${updatedFormData.lastname}$`, $options: "i" },
        },
      ],
    });

    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          error: "Duplicate record found.",
          duplicates: existingUsers.map((u) => ({
            firstname: u.firstname,
            lastname: u.lastname,
          })),
        },
        { status: 409 }
      );
    }

    const updatedUser = await user.findByIdAndUpdate(
      id,
      { $set: updatedFormData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Error updating student info:", error);
    return NextResponse.json(
      { error: "Failed to update student info" },
      { status: 500 }
    );
  }
}
