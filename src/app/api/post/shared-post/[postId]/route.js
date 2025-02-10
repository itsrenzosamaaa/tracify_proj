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
    const { postId } = params;

    const nextPost = await post
      .findOne({ _id: postId, isShared: true })
      .populate({
        path: "sharedBy",
        select:
          "firstname lastname profile_picture resolvedItemCount shareCount birthday",
        populate: { path: "role", select: "name color" }, // ✅ Populate role
      })
      .populate({
        path: "originalPost",
        populate: [
          {
            path: "author",
            select:
              "firstname lastname profile_picture resolvedItemCount shareCount birthday",
            populate: { path: "role", select: "name color" }, // ✅ Populate role
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
      })
      .lean();

    if (nextPost.length === 0) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(nextPost, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
