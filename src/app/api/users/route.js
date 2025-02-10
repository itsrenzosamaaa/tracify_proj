import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import user from "@/lib/models/user";
import role from "@/lib/models/role";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    await dbConnect();

    const findUsers = await user.find().populate('role');

    return NextResponse.json(findUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json(); // Parse the incoming data
    await dbConnect();

    // Step 1: Check for duplicates in the incoming CSV data
    const seenNames = new Set();
    const duplicatesInCSV = [];

    for (const user of data) {
      const fullNameKey = `${user.firstname.toLowerCase()}_${user.lastname.toLowerCase()}`;

      if (seenNames.has(fullNameKey)) {
        duplicatesInCSV.push(user);
      } else {
        seenNames.add(fullNameKey);
      }
    }

    if (duplicatesInCSV.length > 0) {
      return NextResponse.json(
        {
          error: "Duplicate records found in the uploaded file.",
          duplicates: duplicatesInCSV,
        },
        { status: 400 }
      );
    }

    // Step 2: Check for duplicates in the database
    const existingUsers = await user.find({
      $or: data.map(({ firstname, lastname }) => ({
        firstname: { $regex: `^${firstname}$`, $options: "i" },
        lastname: { $regex: `^${lastname}$`, $options: "i" },
      })),
    });

    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          error: "Some records already exist in the database.",
          duplicates: existingUsers.map((u) => ({
            firstname: u.firstname,
            lastname: u.lastname,
          })),
        },
        { status: 409 }
      );
    }

    // Step 3: Process and insert users
    const processedData = await Promise.all(
      data.map(async (user) => {
        user._id =  `user_${nanoid(6)}`;
        user.profile_picture = null;
        user.date_created = Date.now();
        user.resolvedItemCount = 0;
        user.shareCount = 0;
        user.birthday = null;

        if (user.password) {
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }

        return user;
      })
    );

    // Insert users into the database
    const insertedUsers = await user.insertMany(processedData, {
      ordered: false,
    });

    return NextResponse.json(
      { message: "Users imported successfully!", count: insertedUsers.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error importing users:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation error in some records." },
        { status: 400 }
      );
    } else if (error.code === 11000) {
      return NextResponse.json(
        { error: "Some records already exist." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to import users." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account"); // Extract accountId from query params

  if (!accountId) {
    return NextResponse.json(
      { success: false, message: "Account ID is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Delete the user by accountId
    const deletedUser = await user.findByIdAndDelete(accountId);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting user", error: error.message },
      { status: 500 }
    );
  }
}
