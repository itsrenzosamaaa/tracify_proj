import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user";
import roles from "@/lib/models/roles";
import bcrypt from "bcrypt";

const hashPassword = async (password, saltRounds = 10) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Error hashing password");
  }
};

export async function GET() {
  try {
    await dbConnect();

    const findUser = await User.find();

    return NextResponse.json(findUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();

  try {
    const { password, ...formData } = await req.json();

    const hashedPassword = await hashPassword(password);

    const newAccount = new User({
      ...formData,
      password: hashedPassword,
    });

    await newAccount.save();
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
