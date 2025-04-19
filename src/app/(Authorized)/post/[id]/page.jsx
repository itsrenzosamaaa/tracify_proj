"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Grid, Snackbar, Typography, Alert } from "@mui/joy";
import { useTheme, useMediaQuery } from "@mui/material";
import { useSession } from "next-auth/react";
import Loading from "@/app/components/Loading";
import Post from "@/app/components/Post";
import SharedPost from "@/app/components/SharedPost";

const PostPage = ({ params }) => {
  const { data: session, status } = useSession();
  const [post, setPost] = useState();
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const { id } = params;

  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      const filterUsers = data.filter((user) =>
        user?.role?.permissions.includes("User Dashboard")
      );
      setUsers(filterUsers);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`/api/match-items`);
      const data = await res.json();
      const filtered = data.filter(
        (match) =>
          match?.owner?.user?._id === session?.user?.id &&
          ["Pending", "Approved"].includes(match?.request_status)
      );
      setMatches(filtered);
    } catch (err) {
      console.error(err);
    }
  }, [session?.user?.id]);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/location");
      const data = await res.json();
      setLocationOptions(data.reduce((acc, loc) => [...acc, ...loc.areas], []));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/post/one-post/${id}`);
      const data = await response.json();
      setPost(data);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPost();
      fetchUsers();
      fetchMatches();
      fetchLocations();
    }
  }, [status, fetchPost, fetchUsers, fetchLocations, fetchMatches]);

  const isClaimed = post?.owner?.item?.status === "Claimed";
  const isResolved = post?.finder?.item?.status === "Resolved";

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ marginX: isXs ? "" : "15rem" }}>
          {isLoading ? (
            <Loading />
          ) : post ? (
            <>
              {/* ✅ Message if claimed or resolved */}
              {(isClaimed || isResolved) && (
                <Alert
                  color={isClaimed ? "success" : "primary"}
                  variant="soft"
                  sx={{ mb: 2 }}
                >
                  {isClaimed
                    ? "This lost item has already been claimed."
                    : "This found item has already been resolved."}
                </Alert>
              )}

              {post?.isShared ? (
                <>
                  <Typography level="h3" sx={{ mb: 2 }}>
                    Shared To You
                  </Typography>
                  <SharedPost
                    setOpenSnackbar={setOpenSnackbar}
                    setMessage={setMessage}
                    session={session}
                    post={post}
                    sharedBy={post.sharedBy}
                    originalPost={post.originalPost}
                    caption={post.caption}
                    sharedAt={post.sharedAt}
                    isXs={isXs}
                    users={users}
                    locationOptions={locationOptions}
                    matches={matches}
                    fetchMatches={fetchMatches}
                  />
                </>
              ) : (
                <>
                  <Typography level="h3" sx={{ mb: 2 }}>
                    Post
                  </Typography>
                  <Post
                    matches={matches}
                    setOpenSnackbar={setOpenSnackbar}
                    setMessage={setMessage}
                    session={session}
                    post={post}
                    author={post.author}
                    caption={post.caption}
                    item={post?.isFinder ? post?.finder : post?.owner}
                    createdAt={post.createdAt}
                    isXs={isXs}
                    users={users}
                    locationOptions={locationOptions}
                    fetchMatches={fetchMatches}
                  />
                </>
              )}
            </>
          ) : (
            <Typography color="danger">
              Post not found or an error occurred.
            </Typography>
          )}
        </Grid>
      </Grid>

      <Snackbar
        autoHideDuration={5000}
        open={openSnackbar}
        variant="solid"
        color={openSnackbar}
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          setOpenSnackbar(null);
        }}
      >
        {message}
      </Snackbar>
    </>
  );
};

export default PostPage;
