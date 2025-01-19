import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import post from "@/lib/models/post";
import user from "@/lib/models/user";
import item from "@/lib/models/item";
import finder from "@/lib/models/finder";

export async function GET(req) {
  try {
    await dbConnect();

    // Get the lastPostId from URL search params
    const url = new URL(req.url);
    const lastPostId = url.searchParams.get("lastPostId");

    // Build the query based on lastPostId
    const query = lastPostId ? { _id: { $lt: lastPostId } } : {}; // Changed from $gt to $lt for reverse chronological order

    const nextPosts = await post
      .find(query)
      .sort({ createdAt: -1 }) // Reverse chronological order
      .limit(10)
      .populate("author", "firstname lastname profile_picture resolvedItemCount shareCount role birthday")
      .populate("finder", "item")
      .populate({
        path: "finder",
        populate: {
          path: "item",
          select: "name category images monitoredBy status",
          populate: {
            path: "monitoredBy",
            select: "firstname lastname role",
            populate: {
              path: "role",
              select: "name",
            },
          },
        },
      })
      .populate("sharedBy", "firstname lastname profile_picture resolvedItemCount shareCount role birthday")
      .populate({
        path: "originalPost",
        populate: [
          { path: "author", select: "firstname lastname profile_picture resolvedItemCount shareCount role birthday" },
          {
            path: "finder",
            populate: {
              path: "item",
              select: "name images monitoredBy status",
              populate: {
                path: "monitoredBy",
                select: "firstname lastname role",
                populate: {
                  path: "role",
                  select: "name",
                },
              },
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

export async function POST(req) {
  try {
    await dbConnect();
    const postData = await req.json();

    const newPostData = new post(postData);
    await newPostData.save();

    // Populate the new post data before returning
    const populatedPost = await post
      .findById(newPostData._id)
      .populate("author", "firstname lastname profile_picture")
      .populate("item", "name category images")
      .populate("sharedBy", "firstname lastname profile_picture")
      .populate({
        path: "originalPost",
        populate: [
          { path: "author", select: "firstname lastname" },
          { path: "item", select: "name images" },
        ],
      });

    return NextResponse.json(populatedPost, { status: 201 });
  } catch (error) {
    console.error("Error adding post:", error);
    return NextResponse.json({ error: "Failed to add post" }, { status: 500 });
  }
}
