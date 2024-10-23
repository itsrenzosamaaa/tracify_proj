import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import account from "@/lib/models/account";
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

    const findAccounts = await account.find();

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
    const { password, ...accountFormData } = await req.json();

    const hashedPassword = await hashPassword(password);

    const newAccount = new account({
      ...accountFormData,
      password: hashedPassword,
    });

    const savedAccount = await newAccount.save();
    return NextResponse.json(
      { success: true, message: "Account created", _id: savedAccount._id },
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

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account"); // Extract accountId from query params

  try {
    await dbConnect();

    // Delete the account by _id
    const deletedAccount = await account.findByIdAndDelete({_id: accountId});

    if (!deletedAccount) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting account",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
