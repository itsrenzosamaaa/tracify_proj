export const dynamic = "force-dynamic";

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
      isFinder: { $in: [false] },
    };

    if (searchQuery) {
      matchStage.$or = [
        { caption: { $regex: searchQuery, $options: "i" } },
        { item_name: { $regex: searchQuery, $options: "i" } },
      ];
    }

    let allPosts = await post.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
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
          select: "name images status location category",
        },
      },
      {
        path: "owner",
        populate: { path: "item", select: "name images status location category" },
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
      const ownerStatus = post?.owner?.item?.status;
      return ownerStatus !== "Claimed";
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
