import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import accounts from "@/lib/models/accounts";
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

    const findAccounts = await accounts.find();

    return NextResponse.json(findAccounts, { status: 200 });
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
    console.log("Received formData:", formData);
    console.log("Password:", password);

    const hashedPassword = await hashPassword(password);
    console.log("Hashed Password:", hashedPassword);

    const newAccount = new accounts({
      ...formData,
      password: hashedPassword,
    });

    await newAccount.save();

    console.log("Account created successfully");

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
