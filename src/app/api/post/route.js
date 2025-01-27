import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import post from "@/lib/models/post";
import user from "@/lib/models/user";
import item from "@/lib/models/item";
import finder from "@/lib/models/finder";
import owner from "@/lib/models/owner";
import admin from "@/lib/models/admin";

export async function GET(req) {
  try {
    await dbConnect();

    // Get the lastPostId and search query from URL search params
    const url = new URL(req.url);
    const lastPostId = url.searchParams.get("lastPostId");
    const searchQuery = url.searchParams.get("search");

    console.log(searchQuery)

    // Build the query based on lastPostId and search
    let query = {};

    // Add pagination condition if lastPostId exists
    if (lastPostId) {
      query._id = { $lt: lastPostId };
    }

    // Add search conditions if search query exists
    if (searchQuery && searchQuery.trim()) {
      // Escape special regex characters and trim whitespace
      const sanitizedSearch = searchQuery
        .trim()
        .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      
      // Create a case-insensitive regex
      const searchRegex = new RegExp(sanitizedSearch, "i");

      // Expand search to include partial matches
      query.$or = [
        { caption: searchRegex },
        { "finder.item.name": searchRegex },
        { "owner.item.name": searchRegex },
        // Add exact match conditions for better results
        { caption: { $regex: `\\b${sanitizedSearch}\\b`, $options: "i" } },
        { "finder.item.name": { $regex: `\\b${sanitizedSearch}\\b`, $options: "i" } },
        { "owner.item.name": { $regex: `\\b${sanitizedSearch}\\b`, $options: "i" } }
      ];
    }

    const nextPosts = await post
      .find(query)
      .sort({ createdAt: -1 }) // Reverse chronological order
      .limit(2)
      .populate({
        path: "author",
        select:
          "firstname lastname profile_picture resolvedItemCount shareCount role birthday",
      })
      .populate("finder", "item")
      .populate("owner", "item")
      .populate({
        path: "finder",
        populate: {
          path: "item",
          select: "name category images monitoredBy status",
          populate: {
            path: "monitoredBy",
            select: "firstname lastname",
          },
        },
      })
      .populate({
        path: "owner",
        populate: {
          path: "item",
          select: "name category images status",
        },
      })
      .populate(
        "sharedBy",
        "firstname lastname profile_picture resolvedItemCount shareCount role birthday"
      )
      .populate({
        path: "originalPost",
        populate: [
          {
            path: "author",
            select:
              "firstname lastname profile_picture resolvedItemCount shareCount role birthday",
          },
          {
            path: "finder",
            populate: {
              path: "item",
              select: "name images monitoredBy status",
              populate: {
                path: "monitoredBy",
                select: "firstname lastname",
              },
            },
          },
          {
            path: "owner",
            populate: {
              path: "item",
              select: "name category images status",
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

    return NextResponse.json(
      { message: "Post added successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding post:", error);
    return NextResponse.json({ error: "Failed to add post" }, { status: 500 });
  }
}
