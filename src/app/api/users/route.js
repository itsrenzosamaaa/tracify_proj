import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import user from "@/lib/models/user";
import role from "@/lib/models/role";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    await dbConnect();

    const findUsers = await user.find().populate("role");

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
    const data = await request.json();
    await dbConnect();

    const seenNames = new Set();
    const seenEmails = new Set();
    const seenUsernames = new Set();

    const duplicatesInCSV = {
      names: [],
      emails: [],
      usernames: [],
    };

    const invalidEmails = [];

    // ✅ Email Format Validation Regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const isValidEmail = (email) => {
      return email && emailRegex.test(email);
    };

    // ✅ Step 1: Check CSV duplicates and malformed emails
    for (const userData of data) {
      const fullNameKey = `${userData.firstname?.toLowerCase()}_${userData.lastname?.toLowerCase()}`;
      const emailKey = userData.emailAddress?.toLowerCase();
      const usernameKey = userData.username?.toLowerCase();

      // Check duplicate full name
      if (seenNames.has(fullNameKey)) {
        duplicatesInCSV.names.push(userData);
      } else {
        seenNames.add(fullNameKey);
      }

      // Check duplicate email
      if (emailKey) {
        if (seenEmails.has(emailKey)) {
          duplicatesInCSV.emails.push(userData);
        } else {
          seenEmails.add(emailKey);
        }

        // Check email format
        if (!isValidEmail(emailKey)) {
          invalidEmails.push({
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.emailAddress,
          });
        }
      }

      // Check duplicate username
      if (usernameKey) {
        if (seenUsernames.has(usernameKey)) {
          duplicatesInCSV.usernames.push(userData);
        } else {
          seenUsernames.add(usernameKey);
        }
      }
    }

    if (
      duplicatesInCSV.names.length > 0 ||
      duplicatesInCSV.emails.length > 0 ||
      duplicatesInCSV.usernames.length > 0
    ) {
      return NextResponse.json(
        {
          error: "Duplicate records found in the CSV file. Import aborted.",
          duplicates: duplicatesInCSV,
        },
        { status: 400 }
      );
    }

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        {
          error: "Some emails have invalid format.",
          invalidEmails,
        },
        { status: 400 }
      );
    }

    // ✅ Step 2: Check for existing records in DB
    const dbDuplicates = await user.find({
      $or: [
        ...data.map(({ firstname, lastname }) => ({
          firstname: { $regex: `^${firstname}$`, $options: "i" },
          lastname: { $regex: `^${lastname}$`, $options: "i" },
        })),
        ...data
          .map(({ email }) =>
            email
              ? {
                  email: { $regex: `^${email}$`, $options: "i" },
                }
              : null
          )
          .filter(Boolean),
        ...data
          .map(({ username }) =>
            username
              ? {
                  username: { $regex: `^${username}$`, $options: "i" },
                }
              : null
          )
          .filter(Boolean),
      ],
    });

    if (dbDuplicates.length > 0) {
      const duplicateNames = [];
      const duplicateEmails = [];
      const duplicateUsernames = [];

      dbDuplicates.forEach((u) => {
        duplicateNames.push(`${u.firstname} ${u.lastname}`);
        if (u.email) duplicateEmails.push(u.email);
        if (u.username) duplicateUsernames.push(u.username);
      });

      return NextResponse.json(
        {
          error: "Some records already exist in the database. Import aborted.",
          duplicateNames,
          duplicateEmails,
          duplicateUsernames,
        },
        { status: 409 }
      );
    }

    // ✅ Step 3: Insert valid users
    const processedUsers = await Promise.all(
      data.map(async (userData) => {
        userData._id = `user_${nanoid(6)}`;
        userData.profile_picture = null;
        userData.date_created = Date.now();
        userData.resolvedItemCount = 0;
        userData.shareCount = 0;
        userData.birthday = null;

        if (userData.password) {
          const saltRounds = 10;
          userData.password = await bcrypt.hash(userData.password, saltRounds);
        }

        return userData;
      })
    );

    const insertedUsers = await user.insertMany(processedUsers, {
      ordered: true, // All or nothing insert
    });

    return NextResponse.json(
      {
        success: true,
        message: "Users imported successfully!",
        count: insertedUsers.length,
      },
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
        { error: "Duplicate key error - some records already exist." },
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
