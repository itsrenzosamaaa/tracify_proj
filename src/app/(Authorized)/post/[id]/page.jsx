"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Grid, Snackbar } from "@mui/joy";
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
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const { id } = params;
  const [users, setUsers] = useState([]);

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

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/post/one-post/${id}`);
      const data = await response.json();
      setPost(data);
    } catch (error) {
      setError(error);
    }
  }, [id]);
  useEffect(() => {
    if (status === "authenticated") {
      fetchPost();
      fetchUsers();
    }
  }, [status, fetchPost, fetchUsers]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ marginX: isXs ? "" : "15rem" }}>
          {!post ? (
            <Loading />
          ) : post?.isShared ? (
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
            />
          ) : (
            <Post
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
            />
          )}
        </Grid>
      </Grid>
      <Snackbar
        autoHideDuration={5000}
        open={openSnackbar}
        variant="solid"
        color={openSnackbar}
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setOpenSnackbar(null);
        }}
      >
        {message}
      </Snackbar>
    </>
  );
};

export default PostPage;
