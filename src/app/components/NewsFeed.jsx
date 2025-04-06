"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Snackbar,
  Modal,
  ModalDialog,
  DialogContent,
  ModalClose,
  GlobalStyles,
  Input,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "@mui/joy";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Search, Refresh } from "@mui/icons-material";
import TopStudentsEarnedBadges from "./TopStudentsEarnedBadges";
import TopSharers from "./TopSharers";
import SharedPost from "./SharedPost";
import Post from "./Post";
import dayjs from "dayjs";
import PublishLostItem from "./Modal/PublishLostItems";
import PublishFoundItem from "./Modal/PublishFoundItem";
import NoItemsFoundUI from "./NoItemsFound";
import NoMoreSearchResultsUI from "./NoMoreSearchResults";
import NoMorePostsUI from "./NoMorePosts";

const NewsFeed = ({ session, status, users, corner }) => {
  const [posts, setPosts] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [openLostRequestModal, setOpenLostRequestModal] = useState(false);
  const [openFoundRequestModal, setOpenFoundRequestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [locationOptions, setLocationOptions] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isLoadingSharedPosts, setIsLoadingSharedPosts] = useState(false);
  const [fetchedAllPostsOnce, setFetchedAllPostsOnce] = useState(false);
  const [fetchedSharedOnce, setFetchedSharedOnce] = useState(false);

  const observerRef = useRef();
  const abortControllerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const roleColors = {
    Student: "#4CAF50",
    Parent: "#2196F3",
    Faculty: "#FFC107",
    "Security Guard": "#FF5722",
  };

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`/api/match-items`);
      const data = await res.json();
      const filtered = data.filter(
        (match) =>
          !["Completed", "Canceled", "Declined"].includes(match?.request_status)
      );
      setMatches(filtered);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchLostItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/owner/${session?.user?.id}`);
      const data = await res.json();
      setLostItems(data.filter((item) => item?.item?.status === "Missing"));
    } catch (err) {
      console.error("Fetch lost items failed:", err);
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

  const fetchSharedPosts = useCallback(
    async (query = "") => {
      if (!session?.user?.id) return;
      setIsLoadingSharedPosts(true);
      try {
        const url = new URL(
          `/api/post/shared-with-me/${corner}`,
          window.location.origin
        );
        url.searchParams.append("userId", session.user.id);
        if (query.trim()) url.searchParams.append("search", query);

        const res = await fetch(url);
        if (!res.ok) {
          if (res.status === 404) {
            setPosts([]);
            setHasMore(false);
            return;
          }
          throw new Error("Failed to fetch shared posts");
        }
        const data = await res.json();
        setPosts(data.posts || []);
        setHasMore(false);
      } catch (err) {
        console.error("Fetch shared posts failed:", err);
      } finally {
        setIsLoadingSharedPosts(false);
      }
    },
    [corner, session?.user?.id]
  );

  const fetchPosts = useCallback(
    async (query = "", reset = false) => {
      if (loadingMore || isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLoadingMore(true);

      try {
        const newPage = reset ? 1 : page;
        const url = new URL(`/api/post/${corner}`, window.location.origin);
        url.searchParams.append("page", newPage);
        if (query.trim()) url.searchParams.append("search", query);

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          if (res.status === 404) {
            setPosts([]);
            setHasMore(false);
            return;
          }
          throw new Error("Failed to fetch posts");
        }

        const data = await res.json();
        const newPosts = data.posts || [];

        setPosts((prev) => {
          const unique = new Map((reset ? [] : prev).map((p) => [p._id, p]));
          newPosts.forEach((p) => unique.set(p._id, p));
          return Array.from(unique.values());
        });

        setHasMore(data.hasMore ?? false);
        setPage((prev) => prev + 1);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [loadingMore, page, corner]
  );

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const trimmed = tempSearchQuery.trim();
    setSearchQuery(trimmed);
    setSearchPerformed(true);
    setPosts([]);
    setPage(1);
    setHasMore(true);

    if (tabValue === 0) {
      setFetchedAllPostsOnce(true);
      await fetchPosts(trimmed, true);
    } else {
      setFetchedSharedOnce(true);
      await fetchSharedPosts(trimmed);
    }
  };

  const handleRefresh = async (e) => {
    e.preventDefault();
    setSearchQuery("");
    setTempSearchQuery("");
    setSearchPerformed(false);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setFetchedAllPostsOnce(false);
  };

  const lastPostElementRef = useCallback(
    (node) => {
      if (loadingMore || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingMore &&
          !isFetchingRef.current
        ) {
          fetchPosts(searchQuery);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore, fetchPosts, searchQuery]
  );

  useEffect(() => {
    if (status !== "authenticated") return;

    if (tabValue === 0 && !fetchedAllPostsOnce) {
      fetchPosts("", true);
      setFetchedAllPostsOnce(true);
    }

    if (tabValue === 1 && !fetchedSharedOnce) {
      fetchSharedPosts();
      setFetchedSharedOnce(true);
    }

    fetchLostItems();
    fetchMatches();
    fetchLocations();
  }, [
    status,
    tabValue,
    fetchPosts,
    fetchSharedPosts,
    fetchLostItems,
    fetchMatches,
    fetchLocations,
    fetchedAllPostsOnce,
    fetchedSharedOnce,
  ]);

  const birthdayToday = users.filter((user) => {
    if (!user?.birthday) return false;
    return dayjs(user.birthday).format("MM-DD") === dayjs().format("MM-DD");
  });

  return (
    <>
      <GlobalStyles styles={{ "*": { pointerEvents: "auto" } }} />
      <Grid container spacing={2} sx={{ height: "85.5vh" }}>
        <Grid item xs={12}>
          <Box
            sx={{
              paddingX: isXs ? 0 : "16rem",
              maxHeight: "85.5vh",
              height: "100%",
              overflowY: "scroll",
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "transparent" },
              "&:hover::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.4)",
              },
              scrollbarColor: "transparent transparent",
              "&:hover": {
                scrollbarColor: "rgba(0,0,0,0.4) transparent",
              },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography level="h3">
                  {corner === "lost-item" ? "Lost Corner" : "Found Corner"}
                </Typography>
                <IconButton onClick={handleRefresh}>
                  <Refresh />
                </IconButton>
              </Box>
              <form onSubmit={handleSearchSubmit}>
                <Box display="flex" gap={2} alignItems="center">
                  <Input
                    value={tempSearchQuery}
                    onChange={(e) => setTempSearchQuery(e.target.value)}
                    fullWidth
                    sx={{ my: 2 }}
                    startDecorator={<Search />}
                    placeholder={`Search ${
                      corner === "lost-item" ? "lost items" : "found items"
                    }...`}
                  />
                  <Button type="submit" disabled={!tempSearchQuery.trim()}>
                    Search
                  </Button>
                </Box>
              </form>

              {session?.user?.permissions.includes("Request Items") && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  {corner === "found-item" ? (
                    <Button
                      fullWidth
                      onClick={() => setOpenFoundRequestModal(true)}
                    >
                      Report Found Item
                    </Button>
                  ) : (
                    <Button
                      color="danger"
                      fullWidth
                      onClick={() => setOpenLostRequestModal(true)}
                    >
                      Report Lost Item
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            <Tabs
              value={tabValue}
              onChange={(e, newValue) => {
                setTabValue(newValue);
                setPosts([]);
                setPage(1);
                setHasMore(true);
                setTempSearchQuery("");
                setSearchQuery("");
                setSearchPerformed(false);
                if (newValue === 0) {
                  setFetchedAllPostsOnce(false);
                } else {
                  setFetchedSharedOnce(false);
                }
              }}
              sx={{ mb: 2 }}
            >
              <TabList tabFlex={1}>
                <Tab>All Posts</Tab>
                <Tab>Shared With Me</Tab>
              </TabList>

              <TabPanel value={0}>
                {posts.map((post, index) => (
                  <div
                    key={post._id}
                    ref={index === posts.length - 1 ? lastPostElementRef : null}
                  >
                    <Post
                      refreshData={fetchMatches}
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
                      lostItems={lostItems}
                      roleColors={roleColors}
                      users={users}
                    />
                  </div>
                ))}

                {loadingMore && (
                  <Card sx={{ width: "100%", mb: 2 }}>
                    <CardHeader
                      avatar={
                        <Skeleton variant="circular" width={40} height={40} />
                      }
                      title={<Skeleton height={10} width="80%" />}
                      subheader={<Skeleton height={10} width="40%" />}
                    />
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Skeleton height={10} sx={{ mb: 1 }} />
                        <Skeleton height={10} width="80%" />
                      </Box>
                      <Skeleton variant="rectangular" height={300} />
                    </CardContent>
                    <CardActions sx={{ px: 2 }}>
                      <Skeleton height={36} width={100} />
                    </CardActions>
                  </Card>
                )}

                {searchPerformed && posts.length === 0 && !loadingMore && (
                  <NoItemsFoundUI />
                )}
                {!hasMore &&
                  posts.length > 0 &&
                  !loadingMore &&
                  fetchedAllPostsOnce &&
                  (searchPerformed ? (
                    <NoMoreSearchResultsUI />
                  ) : (
                    <NoMorePostsUI />
                  ))}
              </TabPanel>

              <TabPanel value={1}>
                {isLoadingSharedPosts ? (
                  <Skeleton variant="rectangular" height={100} />
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <SharedPost
                      key={post._id}
                      session={session}
                      post={post}
                      sharedBy={post.sharedBy}
                      originalPost={post.originalPost}
                      caption={post.caption}
                      sharedAt={post.sharedAt}
                      isXs={isXs}
                      users={users}
                      setOpenSnackbar={setOpenSnackbar}
                      setMessage={setMessage}
                    />
                  ))
                ) : (
                  <NoItemsFoundUI />
                )}
              </TabPanel>
            </Tabs>
          </Box>
        </Grid>
      </Grid>

      <PublishLostItem
        locationOptions={locationOptions}
        open={openLostRequestModal}
        onClose={() => setOpenLostRequestModal(false)}
        setOpenSnackbar={setOpenSnackbar}
        setMessage={setMessage}
      />
      <PublishFoundItem
        locationOptions={locationOptions}
        open={openFoundRequestModal}
        onClose={() => setOpenFoundRequestModal(false)}
        setOpenSnackbar={setOpenSnackbar}
        setMessage={setMessage}
      />
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

export default NewsFeed;
