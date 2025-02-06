import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import admin from "@/lib/models/admin";
import bcrypt from "bcryptjs";

export async function PUT(req, { params }) {
    const { id } = params;
    const { currentPassword, newPassword, retypePassword } = await req.json();

    try {
        await dbConnect();

        // ✅ Fetch admin details correctly
        const findAdmin = await admin.findById(id).lean();

        if (!findAdmin) {
            return NextResponse.json({ error: "Admin not found" }, { status: 404 });
        }

        // ✅ Validate current password
        const isPasswordValid = bcrypt.compareSync(currentPassword, findAdmin.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }

        // ✅ Validate new password confirmation
        if (newPassword !== retypePassword) {
            return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
        }

        // ✅ Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // ✅ Update password in the database
        const updatedAdmin = await admin.findByIdAndUpdate(
            id,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedAdmin) {
            return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
        }

        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error updating admin password:", error);
        return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
    }
}
