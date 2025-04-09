"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Grid,
  Typography,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Select,
  Option,
  CircularProgress,
} from "@mui/joy";
import { Paper, useTheme, useMediaQuery } from "@mui/material";
import AvatarWithName from "./Profile/AvatarWithName";
import TitleBreadcrumbs from "./Title/TitleBreadcrumbs";
import SharedPost from "./SharedPost";
import Post from "./Post";
import Loading from "./Loading";

const ViewUserProfile = ({
  profile,
  refreshData,
  session,
  setOpenSnackbar,
  setMessage,
  update,
}) => {
  const [posts, setPosts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [lostFilter, setLostFilter] = useState("Claimed");
  const [foundFilter, setFoundFilter] = useState("Resolved");
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));
  const observerRef = useRef();

  const roleColors = {
    Student: "#4CAF50", // Green
    Parent: "#2196F3", // Blue
    Faculty: "#FFC107", // Amber
    "Security Guard": "#FF5722", // Deep Orange
  };

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

  const LOST_STATUS = {
    CLAIMED: "Claimed",
    UNCLAIMED: "Unclaimed",
  };

  const FOUND_STATUS = {
    RESOLVED: "Resolved",
    UNRESOLVED: "Matched", // Note: UI shows "Unresolved" but uses "Matched" value
  };

  // Updated filtering logic as per latest request
  const filterLostItems = (posts, statusFilter) => {
    return posts.filter((post) => {
      const isLostPost = post?.isFinder || post?.originalPost?.isFinder;
      const itemStatus =
        post?.owner?.item?.status || post?.originalPost?.owner?.item?.status;

      // Skip Request only
      if (isLostPost || itemStatus === "Request") return false;

      // Claimed Tab
      if (statusFilter === "Claimed") return itemStatus === "Claimed";

      // Unclaimed Tab
      return itemStatus !== "Claimed";
    });
  };

  const filterFoundItems = (posts, statusFilter) => {
    return posts.filter((post) => {
      const isFoundPost = post?.isFinder || post?.originalPost?.isFinder;
      const itemStatus =
        post?.finder?.item?.status || post?.originalPost?.finder?.item?.status;

      // Skip Request and Surrender Pending
      if (
        !isFoundPost ||
        itemStatus === "Request" ||
        itemStatus === "Surrender Pending"
      )
        return false;

      // Resolved Tab
      if (statusFilter === "Resolved") return itemStatus === "Resolved";

      // Unresolved Tab
      return itemStatus !== "Resolved";
    });
  };

  const lostItemPosts = filterLostItems(posts, lostFilter);
  const foundItemPosts = filterFoundItems(posts, foundFilter);

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
            update={update}
          />
        </Grid>
        {/* <Grid item xs={12} sx={{ marginX: isMd ? 0 : "13rem" }}>
          <Tabs aria-label="Basic tabs" defaultValue={0}>
            <TabList tabFlex={1}>
              <Tab
                sx={{
                  paddingX: { xs: "17%", md: "24%" }, // Adjust padding based on screen size
                }}
              >
                <Typography sx={{ whiteSpace: "nowrap" }}>
                  Lost Item(s)
                </Typography>
              </Tab>
              <Tab
                sx={{
                  paddingX: { xs: "17%", md: "24%" }, // Adjust padding based on screen size
                }}
              >
                <Typography sx={{ whiteSpace: "nowrap" }}>
                  Found Item(s)
                </Typography>
              </Tab>
            </TabList>
            {posts.length > 0 ? (
              <>
                <TabPanel value={0}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Select
                      value={lostFilter}
                      onChange={(e, newValue) => setLostFilter(newValue)}
                      sx={{ width: "10rem", mb: 2 }}
                    >
                      <Option value={LOST_STATUS.CLAIMED}>Claimed</Option>
                      <Option value={LOST_STATUS.UNCLAIMED}>Unclaimed</Option>
                    </Select>
                  </Box>
                  {lostItemPosts.length > 0 &&
                    lostItemPosts.map((post, index) => {
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
                              roleColors={roleColors}
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
                              roleColors={roleColors}
                            />
                          )}
                        </div>
                      );
                    })}
                  {loading && <Loading />}
                  {lostItemPosts.length === 0 ? (
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
                        No posts...
                      </Typography>
                    </Box>
                  ) : !hasMore ? (
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
                  ) : null}
                </TabPanel>
                <TabPanel value={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Select
                      value={foundFilter}
                      onChange={(e, newValue) => setFoundFilter(newValue)}
                      sx={{ width: "10rem", mb: 2 }}
                    >
                      <Option value={FOUND_STATUS.RESOLVED}>Resolved</Option>
                      <Option value={FOUND_STATUS.UNRESOLVED}>
                        Unresolved
                      </Option>
                    </Select>
                  </Box>
                  {foundItemPosts.length > 0 &&
                    foundItemPosts.map((post, index) => {
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
                              roleColors={roleColors}
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
                              roleColors={roleColors}
                            />
                          )}
                        </div>
                      );
                    })}
                  {loading && <Loading />}
                  {foundItemPosts.length === 0 ? (
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
                        No posts...
                      </Typography>
                    </Box>
                  ) : !hasMore ? (
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
                  ) : null}
                </TabPanel>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "10rem", // Adjust as needed
                  width: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Tabs>
        </Grid> */}
      </Grid>
    </>
  );
};

export default ViewUserProfile;
