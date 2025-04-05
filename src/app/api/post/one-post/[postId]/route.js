import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import post from "@/lib/models/post";
import user from "@/lib/models/user";
import item from "@/lib/models/item";
import finder from "@/lib/models/finder";
import owner from "@/lib/models/owner";
import role from "@/lib/models/role";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { postId } = params;

    const findPost = await post
      .findById(postId)
      .populate([
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
          populate: {
            path: "item",
            select: "name images status location category",
          },
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
      ])
      .lean();

    if (!findPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(findPost, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
