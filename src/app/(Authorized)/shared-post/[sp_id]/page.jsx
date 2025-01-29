"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Grid, Snackbar } from "@mui/joy";
import { useTheme, useMediaQuery } from "@mui/material";
import { useSession } from "next-auth/react";
import SharedPost from "@/app/components/SharedPost";
import Loading from "@/app/components/Loading";

const SharedPostPage = ({ params }) => {
  const { data: session, status } = useSession();
  const [post, setPost] = useState();
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const { sp_id } = params;

  const roleColors = {
    Student: "#4CAF50", // Green
    Parent: "#2196F3", // Blue
    Faculty: "#FFC107", // Amber
    "Security Guard": "#FF5722", // Deep Orange
  };

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/post/shared-post/${sp_id}`);
      const data = await response.json();
      setPost(data);
    } catch (error) {
      setError(error);
    }
  }, [sp_id]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPost();
    }
  }, [status, fetchPost]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ marginX: isXs ? "" : "15rem" }}>
          {post !== undefined ? (
            <SharedPost
              setOpenSnackbar={setOpenSnackbar}
              setMessage={setMessage}
              session={session}
              post={post}
              sharedBy={post?.sharedBy}
              originalPost={post?.originalPost}
              caption={post?.caption}
              sharedAt={post?.sharedAt}
              isXs={isXs}
              roleColors={roleColors}
            />
          ) : (
            <Loading />
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

export default SharedPostPage;
