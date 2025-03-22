import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import user from "@/lib/models/user";
import role from "@/lib/models/role";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    await dbConnect();

    const findUser = await user
      .findOne({ _id: id })
      .populate({
        path: "role",
        select: "name color",
      })
      .lean();

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

    // ✅ Validate email format
    const emailRegex = /^[a-z]+@thelewiscollege\.edu\.ph$/;
    const isValidEmail = emailRegex.test(updatedFormData.emailAddress);

    if (!isValidEmail) {
      return NextResponse.json(
        {
          message:
            "Invalid email address. Please ensure it is lowercase and ends with @thelewiscollege.edu.ph",
        },
        { status: 400 }
      );
    }

    // ✅ Check for duplicate firstname+lastname (exclude current user)
    const duplicateUser = await user.findOne({
      _id: { $ne: id }, // Exclude current user
      firstname: { $regex: `^${updatedFormData.firstname}$`, $options: "i" },
      lastname: { $regex: `^${updatedFormData.lastname}$`, $options: "i" },
    });

    if (duplicateUser) {
      return NextResponse.json(
        {
          error: "Duplicate record found.",
          duplicates: {
            firstname: duplicateUser.firstname,
            lastname: duplicateUser.lastname,
          },
        },
        { status: 409 }
      );
    }

    // ✅ Proceed to update the user
    const updatedUser = await user.findByIdAndUpdate(
      id,
      { $set: updatedFormData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user info." },
      { status: 500 }
    );
  }
}
