import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req, { params }) {
    const { id } = params;

    try {
        const { profile_picture } = await req.json();
        if (!profile_picture) {
            return NextResponse.json(
                { error: "Profile picture is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Upload new profile picture
        const uploadResult = await cloudinary.uploader.upload(profile_picture, {
            folder: "user_profile_picture",
            public_id: `${user.firstname}_${Date.now()}`,
            overwrite: true,
            resource_type: "auto", // Automatically detect resource type
            transformation: [
                { width: 500, height: 500, crop: "limit" } // Optional: resize image
            ]
        });

        // Update user document with new profile picture URL
        user.profile_picture = uploadResult.secure_url;
        await user.save();

        return NextResponse.json({
            message: "Profile picture updated successfully",
            url: uploadResult.secure_url
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating profile picture:", error);
        return NextResponse.json(
            { error: "Failed to update profile picture" },
            { status: 500 }
        );
    }
}