import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import user from "@/lib/models/user";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await dbConnect();

    const findUser = await user.find();

    return NextResponse.json(findUser, { status: 200 });
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

    const emailRegex = /^[a-z]+@thelewiscollege\.edu\.ph$/;
    const invalidEmails = [];
    const validData = [];

    for (const user of data) {
      const isValidEmail = emailRegex.test(user.emailAddress);

      if (!isValidEmail) {
        invalidEmails.push({
          firstname: user.firstname,
          lastname: user.lastname,
          emailAddress: user.emailAddress,
        });
      } else {
        validData.push(user);
      }
    }

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid email addresses found.",
          invalidEmails,
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
        user._id = user.username;
        user.badges = [];
        user.profile_picture = null;
        user.selectedBadge = null;
        user.date_created = Date.now();
        user.resolvedItemCount = 0;
        user.ratingsCount = 0;

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
