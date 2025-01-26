import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import admin from "@/lib/models/admin";
import roles from "@/lib/models/roles";
import bcrypt from "bcryptjs";

export async function GET(req) {
  try {
    await dbConnect();

    const findAdmin = await admin.find();

    return NextResponse.json(findAdmin, { status: 200 });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
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
    const existingUsers = await admin.find({
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

    const processedData = await Promise.all(
      data.map(async (admin) => {
        admin.date_created = Date.now();

        const emailRegex = /^[a-z]+@thelewiscollege\.edu\.ph$/;

        const isValidEmail = emailRegex.test(admin.emailAddress);

        if (!isValidEmail) {
          return NextResponse.json(
            {
              message:
                "Invalid email address. Please ensure the email uses lowercase letters only and ends with @thelewiscollege.edu.ph.",
            },
            { status: 400 } // Status 400 indicates a bad request
          );
        }

        if (admin.password) {
          const saltRounds = 10;
          admin.password = await bcrypt.hash(admin.password, saltRounds);
        }

        return admin;
      })
    );

    const insertedAdmin = await admin.insertMany(processedData, {
      ordered: false,
    });

    return NextResponse.json(
      { message: "Admins imported successfully!", count: insertedAdmin.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error importing admins:", error);

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
      { error: "Failed to import admins." },
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

    // Delete the admin by accountId
    const deletedAdmin = await admin.findByIdAndDelete(accountId);

    if (!deletedAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting admin", error: error.message },
      { status: 500 }
    );
  }
}
