"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Table,
  List,
  ListItem,
  Snackbar,
  GlobalStyles
} from "@mui/joy";
import {
  Paper,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Card,
  CardContent,
  TableContainer,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Loading from "../Loading";
import TopStudentsEarnedBadges from "../TopStudentsEarnedBadges";
import { Circle } from "@mui/icons-material";
import TopSharers from "../TopSharers";
import SharedPost from "../SharedPost";
import Post from "../Post";

const UserDashboard = ({ session, status, users }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const lastPostRef = useRef();

  console.log(posts);

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return; // Prevent fetch if already loading or no more posts
    setLoading(true);
    try {
      const lastId = posts.length > 0 ? posts[posts.length - 1]._id : "";

      // Construct URL with the proper query parameter
      const url = new URL("/api/post", window.location.origin);
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
      const postsToAdd = Array.isArray(data) ? data : [data];

      setPosts((prevPosts) => {
        const newPosts = [...prevPosts];

        // Filter out duplicates based on post ID
        postsToAdd.forEach((post) => {
          if (!newPosts.some((existingPost) => existingPost._id === post._id)) {
            newPosts.push(post);
          }
        });

        return newPosts;
      });
    } catch (error) {
      console.error("Failed to fetch post:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    hasMore,
    posts,
    setPosts,
    setLoading,
    setHasMore,
    setError,
  ]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            fetchPosts();
          }
        },
        {
          rootMargin: "100px",
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, fetchPosts]
  );

  useEffect(() => {
    if (status === "authenticated" && posts.length === 0) {
      fetchPosts(); // Trigger the first fetch when lastPostId is null
    }
  }, [status, posts.length, fetchPosts]); // Trigger effect if status or lastPostId changes

  if (loading && posts.length === 0) return <Loading />;

  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <>
      <GlobalStyles
        styles={{
          "@keyframes fadeIn": {
            from: {
              opacity: 0,
            },
            to: {
              opacity: 1,
            },
          },
        }}
      />
      <Grid container spacing={2} sx={{ height: "85.5vh" }}>
        <Grid item lg={8}>
          <Box
            sx={{
              paddingRight: "calc(0 + 8px)", // Add extra padding to account for scrollbar width
              paddingX: "7rem",
              maxHeight: "85.5vh",
              height: "100%",
              overflowX: "hidden",
              overflowY: "scroll", // Always reserve space for scrollbar
              // Default scrollbar styles (invisible)
              "&::-webkit-scrollbar": {
                width: "8px", // Always reserve 8px width
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "transparent", // Invisible by default
                borderRadius: "4px",
              },
              // Show scrollbar on hover
              "&:hover": {
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0, 0, 0, 0.4)", // Only change the thumb color on hover
                },
              },
              // Firefox
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent", // Both track and thumb transparent
              "&:hover": {
                scrollbarColor: "rgba(0, 0, 0, 0.4) transparent", // Show thumb on hover
              },
              // IE and Edge
              msOverflowStyle: "-ms-autohiding-scrollbar",
            }}
          >
            {posts.map((post, index) => {
              const isLastElement = index === posts.length - 1;

              return (
                <div
                  key={post._id}
                  ref={isLastElement ? lastPostElementRef : null}
                >
                  {post.isShared ? (
                    <SharedPost
                      setOpenSnackbar={setOpenSnackbar}
                      setMessage={setMessage}
                      session={session}
                      post={post}
                      sharedBy={post.sharedBy}
                      originalPost={post.originalPost}
                      caption={post.caption}
                      sharedAt={post.sharedAt}
                    />
                  ) : (
                    <Post
                      setOpenSnackbar={setOpenSnackbar}
                      setMessage={setMessage}
                      session={session}
                      post={post}
                      author={post.author}
                      caption={post.caption}
                      item={post.item}
                      createdAt={post.createdAt}
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
          </Box>
        </Grid>
        <Grid item lg={4}>
          <Box
            sx={{
              paddingRight: "calc(0 + 8px)", // Add extra padding to account for scrollbar width
              maxHeight: "85.5vh",
              height: "100%",
              overflowX: "hidden",
              overflowY: "scroll", // Always reserve space for scrollbar
              // Default scrollbar styles (invisible)
              "&::-webkit-scrollbar": {
                width: "8px", // Always reserve 8px width
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "transparent", // Invisible by default
                borderRadius: "4px",
              },
              // Show scrollbar on hover
              "&:hover": {
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0, 0, 0, 0.4)", // Only change the thumb color on hover
                },
              },
              // Firefox
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent", // Both track and thumb transparent
              "&:hover": {
                scrollbarColor: "rgba(0, 0, 0, 0.4) transparent", // Show thumb on hover
              },
              // IE and Edge
              msOverflowStyle: "-ms-autohiding-scrollbar",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TopStudentsEarnedBadges users={users} />
              <TopSharers users={users} />
            </Box>
          </Box>
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

export default UserDashboard;
