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
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json(); // Expect an array of users
    await dbConnect();

    // Process the data before inserting
    const processedData = await Promise.all(
      data.map(async (user) => {
        // Convert "[]" string to an empty array for badges
        user.badges = user.badges ? JSON.parse(user.badges) : [];

        // Convert "null" string to actual null for selectedBadge
        user.profile_picture = user.profile_picture === "null" ? null : user.profile_picture;
        user.selectedBadge = user.selectedBadge === "null" ? null : user.selectedBadge;

        // Set date_created to current date if empty
        user.date_created = user.date_created || Date.now();

        // Hash the password before saving it
        if (user.password) {
          const saltRounds = 10; // You can adjust the number of salt rounds
          user.password = await bcrypt.hash(user.password, saltRounds);
        }

        return user;
      })
    );

    // Use `insertMany` for bulk insertion
    const insertedUsers = await user.insertMany(processedData, { ordered: false });

    return new Response(
      JSON.stringify({ message: 'Users imported successfully!', count: insertedUsers.length }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error importing users:', error);

    // Handle validation or duplicate key errors
    if (error.name === 'ValidationError') {
      return new Response(JSON.stringify({ error: 'Validation error in some records.' }), { status: 400 });
    } else if (error.code === 11000) { // Duplicate key error code
      return new Response(JSON.stringify({ error: 'Some records already exist.' }), { status: 409 });
    }

    return new Response(JSON.stringify({ error: 'Failed to import users.' }), { status: 500 });
  }
}