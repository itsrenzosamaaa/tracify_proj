import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import accounts from "@/lib/models/accounts";
import dbConnect from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    await dbConnect();
    console.log("Database connected");

    const user = await accounts.findOne({ username });
    console.log("Fetched User: ", user);

    if (user) {
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      console.log(isPasswordValid);

      if (isPasswordValid) {
        const userResponse = {
          id: user._id,
          firstname: user.name?.firstname,
          lastname: user.name?.lastname,
          username: user.username,
          email: user.email,
          role: user.role,
        };

        if (user.name?.middlename) {
          userResponse.middlename = user.name.middlename;
        }

        return NextResponse.json(userResponse);
      } else {
        console.log("Invalid password");
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }
    } else {
      console.log('User not found');
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
