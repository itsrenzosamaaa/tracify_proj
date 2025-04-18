import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import post from "@/lib/models/post";
import user from "@/lib/models/user";
import item from "@/lib/models/item";
import finder from "@/lib/models/finder";
import owner from "@/lib/models/owner";
import role from "@/lib/models/role";

export async function GET(req) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const searchQuery = url.searchParams.get("search")?.trim()?.toLowerCase();
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    let matchStage = {
      isShared: { $in: [true, false] },
    };

    if (searchQuery) {
      matchStage.$or = [
        { caption: { $regex: searchQuery, $options: "i" } },
        { item_name: { $regex: searchQuery, $options: "i" } },
      ];
    }

    let allPosts = await post.aggregate([
      { $match: matchStage },
      { $addFields: { randomSort: { $rand: {} } } },
      { $sort: { randomSort: 1 } },
    ]);

    allPosts = await post.populate(allPosts, [
      {
        path: "author",
        select:
          "firstname lastname profile_picture resolvedItemCount shareCount birthday",
        populate: { path: "role", select: "name color permissions" },
      },
      {
        path: "finder",
        populate: {
          path: "item",
          select: "name images status location",
        },
      },
      {
        path: "owner",
        populate: { path: "item", select: "name images status location" },
      },
      {
        path: "sharedBy",
        select:
          "firstname lastname profile_picture resolvedItemCount shareCount birthday",
        populate: { path: "role", select: "name color permissions" },
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
            populate: { path: "item", select: "name images status location" },
          },
          {
            path: "owner",
            populate: {
              path: "item",
              select: "name images status location",
            },
          },
        ],
      },
    ]);

    const filteredPosts = allPosts.filter((post) => {
      if (!post.isShared) {
        const finderStatus = post?.finder?.item?.status;
        const ownerStatus = post?.owner?.item?.status;
        return (
          !["Resolved", "Matched"].includes(finderStatus) &&
          ownerStatus !== "Claimed"
        );
      } else {
        const sharedFinderStatus = post?.originalPost?.finder?.item?.status;
        const sharedOwnerStatus = post?.originalPost?.owner?.item?.status;
        return (
          !["Resolved", "Matched"].includes(sharedFinderStatus) &&
          sharedOwnerStatus !== "Claimed"
        );
      }
    });

    const paginatedPosts = filteredPosts.slice(skip, skip + limit);
    const hasMore = skip + limit < filteredPosts.length;

    if (paginatedPosts.length === 0) {
      return NextResponse.json({ error: "No more posts" }, { status: 404 });
    }

    return NextResponse.json(
      { posts: paginatedPosts, hasMore },
      { status: 200 }
    );
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
