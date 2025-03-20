import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import post from "@/lib/models/post";
import user from "@/lib/models/user";
import item from "@/lib/models/item";
import owner from "@/lib/models/owner";
import finder from "@/lib/models/finder";
import role from "@/lib/models/role";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    // Get the lastPostId from URL search params
    const { userId } = params;
    const url = new URL(req.url);
    const lastPostId = url.searchParams.get("lastPostId");

    // Build the query based on lastPostId
    const query = {
      $or: [
        { author: userId }, // Posts created by the user
        { sharedBy: userId }, // Posts shared by the user
      ],
      ...(lastPostId && { _id: { $lt: lastPostId } }), // Pagination
    }; // Changed from $gt to $lt for reverse chronological order

    const nextPosts = await post
      .find(query)
      .sort({ createdAt: -1 }) // Reverse chronological order
      .limit(10)
      .populate({
        path: "author",
        select:
          "firstname lastname profile_picture resolvedItemCount shareCount birthday",
        populate: { path: "role", select: "name color permissions" }, // ✅ Populate role
      })
      .populate("finder", "item")
      .populate("owner", "item")
      .populate({
        path: "finder",
        populate: {
          path: "item",
          select: "name category images status location date_time",
        },
      })
      .populate({
        path: "owner",
        populate: {
          path: "item",
          select: "name category images status location date_time",
        },
      })
      .populate({
        path: "sharedBy",
        select:
          "firstname lastname profile_picture resolvedItemCount shareCount birthday",
        populate: { path: "role", select: "name color permissions" }, // ✅ Populate role
      })
      .populate({
        path: "originalPost",
        populate: [
          {
            path: "author",
            select:
              "firstname lastname profile_picture resolvedItemCount shareCount birthday",
            populate: { path: "role", select: "name color permissions" }, // ✅ Populate role
          },
          {
            path: "finder",
            populate: {
              path: "item",
              select: "name images status location date_time",
            },
          },
          {
            path: "owner",
            populate: {
              path: "item",
              select: "name category images status location date_time",
            },
          },
        ],
      });

    if (nextPosts.length === 0) {
      return NextResponse.json({ error: "No more posts" }, { status: 404 });
    }

    return NextResponse.json(nextPosts, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
