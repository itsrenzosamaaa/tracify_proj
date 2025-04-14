// File: /app/api/post/shared-with-me/[corner]/route.js

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import post from "@/lib/models/post";
import user from "@/lib/models/user";
import item from "@/lib/models/item";
import finder from "@/lib/models/finder";
import owner from "@/lib/models/owner";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const search = url.searchParams.get("search")?.trim()?.toLowerCase() || "";
    const corner = params.corner; // "lost-item" or "found-item"

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Build match stage for shared posts
    let matchStage = {
      sharedTo: userId,
      isShared: true,
    };

    // Add search filter (applies to post.caption or item name)
    if (search) {
      matchStage.$or = [
        { caption: { $regex: search, $options: "i" } },
        { item_name: { $regex: search, $options: "i" } }, // fallback, in case you store item name directly
      ];
    }

    // Fetch base shared posts
    const posts = await post.aggregate([
      { $match: matchStage },
      { $sort: { sharedAt: -1 } },
    ]);

    // Populate related data
    const populated = await post.populate(posts, [
      {
        path: "sharedBy",
        select:
          "firstname lastname profile_picture resolvedItemCount shareCount birthday",
        populate: {
          path: "role",
          select: "name color permissions",
        },
      },
      {
        path: "originalPost",
        populate: [
          {
            path: "author",
            select:
              "firstname lastname profile_picture resolvedItemCount shareCount birthday",
            populate: { path: "role", select: "name color permissions" },
          },
          {
            path: "finder",
            populate: { path: "item", select: "name images status location questions category date_time distinctiveMarks" },
          },
          {
            path: "owner",
            populate: { path: "item", select: "name images status location category date_time distinctiveMarks" },
          },
        ],
      },
    ]);

    // Filter based on `corner` by checking if finder/owner exists in originalPost
    const filtered = populated.filter((p) => {
      if (corner === "lost-item") return p.originalPost?.owner;
      if (corner === "found-item") return p.originalPost?.finder;
      return false;
    });

    return NextResponse.json({ posts: filtered }, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch shared posts:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
