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

    const url = new URL(req.url);
    const searchQuery = url.searchParams.get("search")?.trim()?.toLowerCase();
    const page = parseInt(url.searchParams.get("page")) || 1; // Get current page, default to 1
    const limit = 3; // Number of posts per fetch
    const skip = (page - 1) * limit; // Calculate how many posts to skip

    let matchStage = {
      isShared: { $in: [true, false] },
    };

    // ✅ Apply search filtering if `searchQuery` exists
    if (searchQuery) {
      matchStage.$or = [
        { caption: { $regex: searchQuery, $options: "i" } },
        { item_name: { $regex: searchQuery, $options: "i" } },
      ];
    }

    // ✅ Aggregation Pipeline with Randomization & Pagination
    let nextPosts = await post.aggregate([
      { $match: matchStage }, // Apply search filters
      { $sample: { size: 50 } }, // Randomize from a larger pool (adjust size if needed)
      { $skip: skip }, // Apply pagination offset
      { $limit: limit }, // Fetch only `limit` number of posts
    ]);

    // ✅ Populate fields
    nextPosts = await post.populate(nextPosts, [
      { path: "author", select: "firstname lastname profile_picture resolvedItemCount shareCount role birthday" },
      {
        path: "finder",
        populate: {
          path: "item",
          select: "category images status location",
        },
      },
      { path: "owner", populate: { path: "item", select: "category images status location" } },
      { path: "sharedBy", select: "firstname lastname profile_picture resolvedItemCount shareCount role birthday" },
      {
        path: "originalPost",
        populate: [
          {
            path: "author",
            select: "firstname lastname profile_picture resolvedItemCount shareCount role birthday",
          },
          {
            path: "finder",
            populate: { path: "item", select: "images status location" },
          },
          { path: "owner", populate: { path: "item", select: "category images status location" } },
        ],
      },
    ]);

    // ✅ Remove resolved/claimed posts
    nextPosts = nextPosts.filter((post) => {
      if (!post.isShared) {
        return post?.finder?.item?.status !== "Resolved" && post?.owner?.item?.status !== "Claimed";
      }
      return post?.originalPost?.finder?.item?.status !== "Resolved" && post?.originalPost?.owner?.item?.status !== "Claimed";
    });

    if (!nextPosts.length) {
      return NextResponse.json({ error: "No more posts" }, { status: 404 });
    }

    return NextResponse.json(nextPosts, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const postData = await req.json();

    const newPostData = new post(postData);
    await newPostData.save();

    return NextResponse.json(
      newPostData,
      { message: "Post added successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding post:", error);
    return NextResponse.json({ error: "Failed to add post" }, { status: 500 });
  }
}
