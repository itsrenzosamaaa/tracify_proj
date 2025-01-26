"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Grid, Typography, Box } from "@mui/joy";
import { Paper, useTheme, useMediaQuery } from "@mui/material";
import AvatarWithName from "./Profile/AvatarWithName";
import Badges from "./Profile/Badges";
import ProgBadgeDisplay from "./Profile/ProgBadgeDisplay";
import RecentRatingsFromUser from "./Profile/RecentRatingsFromUser";
import TitleBreadcrumbs from "./Title/TitleBreadcrumbs";
import SharedPost from "./SharedPost";
import Post from "./Post";
import Loading from "./Loading";

const ViewUserProfile = ({
  profile,
  items,
  receivedRatings,
  sentRatings,
  refreshData,
  session,
  setOpenSnackbar,
  setMessage,
  badges,
}) => {
  const [posts, setPosts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));
  const observerRef = useRef();

  const fetchLostItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/owner/${session?.user?.id}`);
      const data = await response.json();
      const filteredItems = data.filter(
        (lostItem) => lostItem?.item?.status === "Missing"
      );
      setLostItems(filteredItems);
    } catch (error) {
      console.error("Failed to fetch post:", error);
      setError(error.message);
    }
  }, [session?.user?.id]);

  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch(`/api/match-items`);
      const data = await response.json();
      const filteredMatches = data.filter(
        (match) =>
          match?.finder?.item?.status === "Matched" ||
          match?.finder?.item?.status === "Resolved"
      );
      setMatches(filteredMatches);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return; // Prevent fetch if already loading or no more posts
    setLoading(true);
    try {
      const lastId = posts.length > 0 ? posts[posts.length - 1]._id : "";

      // Construct URL with the proper query parameter
      const url = new URL(
        `/api/post/${session?.user?.id}`,
        window.location.origin
      );
      if (lastId) {
        url.searchParams.append("lastPostId", lastId);
      }

      const response = await fetch(url);
      const data = await response.json();

      if ("error" in data) {
        setHasMore(false);
        return;
      }

      // Check if data is an array, if not, wrap it into an array
      const newPosts = Array.isArray(data) ? data : [data];
      setPosts((prevPosts) => [
        ...prevPosts,
        ...newPosts.filter(
          (post) => !prevPosts.some((p) => p._id === post._id)
        ),
      ]);
    } catch (error) {
      console.error("Failed to fetch post:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, posts, session?.user?.id]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore) {
            fetchPosts();
          }
        },
        { rootMargin: "100px" }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, fetchPosts]
  );

  useEffect(() => {
    if (session?.user?.id && posts.length === 0) {
      fetchPosts(); // Trigger the first fetch when lastPostId is null
      fetchLostItems();
      fetchMatches();
    }
  }, [
    session?.user?.id,
    posts.length,
    fetchPosts,
    fetchLostItems,
    fetchMatches,
  ]);

  return (
    <>
      <TitleBreadcrumbs title="Profile" text="Profile" />

      <Grid container spacing={2} sx={{ marginBottom: "1rem" }}>
        <Grid item xs={12}>
          <AvatarWithName
            profile={profile}
            session={session}
            refreshData={refreshData}
            setOpenSnackbar={setOpenSnackbar}
            setMessage={setMessage}
          />
        </Grid>
        <Grid item xs={12} sx={{ paddingX: isMd ? "1rem" : "13rem" }}>
          <Typography level="h3" sx={{ paddingBottom: "1rem" }}>
            Posts
          </Typography>
          {posts.map((post, index) => {
            const isLastElement = index === posts.length - 1;

            return (
              <div
                key={post._id}
                ref={isLastElement ? lastPostElementRef : null}
              >
                {post.isShared ? (
                  <SharedPost
                    refreshData={fetchMatches}
                    matches={matches}
                    setOpenSnackbar={setOpenSnackbar}
                    setMessage={setMessage}
                    session={session}
                    post={post}
                    sharedBy={post.sharedBy}
                    originalPost={post.originalPost}
                    caption={post.caption}
                    sharedAt={post.sharedAt}
                    isXs={isXs}
                    lostItems={lostItems}
                  />
                ) : (
                  <Post
                    refreshData={fetchMatches}
                    matches={matches}
                    setOpenSnackbar={setOpenSnackbar}
                    setMessage={setMessage}
                    session={session}
                    post={post}
                    author={post.author}
                    caption={post.caption}
                    item={post.isFinder ? post.finder : post.owner}
                    createdAt={post.createdAt}
                    isXs={isXs}
                    lostItems={lostItems}
                  />
                )}
              </div>
            );
          })}
          {loading && <Loading />}
          {!hasMore && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100px",
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                borderRadius: "md",
                p: 2,
                boxShadow: 1,
                animation: "fadeIn 0.5s ease-out",
              }}
            >
              <Typography
                level="h6"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              >
                No more posts...
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default ViewUserProfile;
