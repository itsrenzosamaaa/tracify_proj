import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import user from "@/lib/models/user";
import badge from "@/lib/models/badge";

export async function PUT(req, { params }) {
    const { userId } = params;

    try {
        const body = await req.json();
        const { badgeId } = body;

        console.log("Awarding badge:", badgeId);

        // Connect to the database
        await dbConnect();

        // Find the user
        const findUser = await user.findOne({ _id: userId });

        if (!findUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if the badge has already been awarded
        if (findUser.badges.includes(badgeId)) {
            // Skip the awarding process without returning an error
            return NextResponse.json({ message: "Badge already awarded (no changes made)" }, { status: 200 });
        }

        // Find the badge
        const findBadge = await badge.findOne({ _id: badgeId });
        if (!findBadge) {
            return NextResponse.json({ error: "Badge not found" }, { status: 404 });
        }

        // Award the badge
        findUser.badges.push(badgeId);
        await findUser.save();

        return NextResponse.json({ message: "Badge awarded successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error awarding badge:", error);
        return NextResponse.json({ error: "Failed to award badge" }, { status: 500 });
    }
}
