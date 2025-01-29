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
    const lastPostId = url.searchParams.get("lastPostId");
    const searchQuery = url.searchParams.get("search");

    // Base query (can filter by `isShared`, `_id` but not populated fields yet)
    let queryBuilder = post.find({
      isShared: { $in: [true, false] }, // Include both shared and non-shared posts
    });

    // Add pagination
    if (lastPostId) {
      queryBuilder = queryBuilder.where("_id").lt(lastPostId);
    }

    // Add sorting and limit
    queryBuilder = queryBuilder.sort({ createdAt: -1 }).limit(3);

    // Add population
    queryBuilder = queryBuilder
      .populate({
        path: "author",
        select:
          "firstname lastname profile_picture resolvedItemCount shareCount role birthday",
      })
      .populate({
        path: "finder",
        populate: {
          path: "item",
          select: "name category images monitoredBy status location date_time",
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
          select: "name category images status location date_time",
        },
      })
      .populate({
        path: "sharedBy",
        select:
          "firstname lastname profile_picture resolvedItemCount shareCount role birthday",
      })
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
              select: "name images monitoredBy status location date_time",
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
              select: "name category images status location date_time",
            },
          },
        ],
      });

    // Execute the query
    let nextPosts = await queryBuilder.exec();
    if (searchQuery?.trim()) {
      nextPosts = nextPosts.filter(
        (post) =>
          post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post?.finder?.item?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          post?.owner?.item?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          post?.originalPost?.finder?.item?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          post?.originalPost?.owner?.item?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }
    // 🔥 Manual filtering (since MongoDB can't filter populated fields)
    nextPosts = nextPosts.filter((post) => {
      // For regular posts
      if (!post.isShared) {
        return (
          post?.finder?.item?.status !== "Resolved" &&
          post?.owner?.item?.status !== "Claimed"
        );
      }

      // For shared posts
      if (post.isShared) {
        return (
          post?.originalPost?.finder?.item?.status !== "Resolved" &&
          post?.originalPost?.owner?.item?.status !== "Claimed"
        );
      }

      return true;
    });

    if (!nextPosts.length) {
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
      newPostData,
      { message: "Post added successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding post:", error);
    return NextResponse.json({ error: "Failed to add post" }, { status: 500 });
  }
}
