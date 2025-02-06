"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Table,
  List,
  ListItem,
  Snackbar,
  Drawer,
  Modal,
  ModalDialog,
  DialogContent,
  ModalClose,
  GlobalStyles,
  Input,
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
  CardHeader,
  CardContent,
  CardActions,
  TableContainer,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Loading from "../Loading";
import TopStudentsEarnedBadges from "../TopStudentsEarnedBadges";
import TopSharers from "../TopSharers";
import SharedPost from "../SharedPost";
import Post from "../Post";
import dayjs from "dayjs";
import { Search } from "@mui/icons-material";
import PublishLostItem from "../Modal/PublishLostItems";
import PublishFoundItem from "../Modal/PublishFoundItem";

const UserDashboard = ({ session, status, users }) => {
  const [posts, setPosts] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(false);
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
  const observerRef = useRef();
  const lastPostRef = useRef();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  const roleColors = {
    Student: "#4CAF50", // Green
    Parent: "#2196F3", // Blue
    Faculty: "#FFC107", // Amber
    "Security Guard": "#FF5722", // Deep Orange
  };

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

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch("/api/location");
      const data = await response.json();

      const allRooms = data.reduce((acc, location) => {
        return [...acc, ...location.areas];
      }, []);

      setLocationOptions(allRooms);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchPosts = useCallback(
    async (query = "", reset = false) => {
      if (loadingMore || !hasMore) return;
      setLoadingMore(true);

      try {
        const newPage = reset ? 1 : page; // If reset (new search), start from page 1
        const url = new URL("/api/post", window.location.origin);
        url.searchParams.append("page", newPage);
        if (query.trim()) url.searchParams.append("search", query);

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        if (!data || "error" in data || data.length === 0) {
          setHasMore(false);
          return;
        }

        setPosts((prevPosts) => (reset ? data : [...prevPosts, ...data])); // Reset on search, append on scroll
        setPage((prevPage) => prevPage + 1);
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoadingMore(false);
      }
    },
    [loadingMore, hasMore, page]
  );

  /**
   * ✅ Handles search submit by resetting posts and refetching
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(tempSearchQuery);
    setHasMore(true);
    setPosts([]);
    setPage(1);
    fetchPosts(tempSearchQuery, true); // Reset pagination on new search
  };

  /**
   * ✅ Implements search debouncing (500ms delay before fetching)
   */
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchPosts(searchQuery, true);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, fetchPosts]);

  /**
   * ✅ Handles infinite scrolling with Intersection Observer
   */
  const lastPostElementRef = useCallback(
    (node) => {
      if (loadingMore) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingMore) {
            fetchPosts(searchQuery);
          }
        },
        { threshold: 1.0 }
      );

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore, fetchPosts, searchQuery]
  );

  useEffect(() => {
    if (status === "authenticated" && posts.length === 0) {
      fetchPosts(); // Trigger the first fetch when lastPostId is null
      fetchLostItems();
      fetchMatches();
      fetchLocations();
    }
  }, [
    status,
    posts.length,
    fetchPosts,
    fetchLostItems,
    fetchMatches,
    fetchLocations,
  ]); // Trigger effect if status or lastPostId changes

  const birthdayToday = users.filter(
    (user) =>
      dayjs(user.birthday).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
  );

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
        <Grid item xs={12} md={7.8}>
          <Box
            sx={{
              paddingRight: "calc(0 + 8px)", // Add extra padding to account for scrollbar width
              paddingX: isXs ? 0 : "7rem",
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography level={isXs ? "h4" : "h3"} sx={{ mb: 2 }}>
                  News Feed
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {isMd && (
                    <>
                      <Button
                        size="small"
                        onClick={() => setOpenDrawer("finders")}
                      >
                        Top Finders
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setOpenDrawer("sharers")}
                      >
                        Top Sharers
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
              <form
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
                onSubmit={handleSearchSubmit} // ✅ No handleRefresh() needed
              >
                <Box display="flex" gap={2} alignItems="center">
                  <Input
                    value={tempSearchQuery} // ✅ Used for typing
                    onChange={(e) => setTempSearchQuery(e.target.value)}
                    fullWidth
                    sx={{ my: 2 }}
                    startDecorator={<Search />}
                    placeholder="Search lost & found items..."
                  />
                  <Button type="submit" disabled={!tempSearchQuery.trim()}>
                    Search
                  </Button>
                </Box>
              </form>

              {isMd && (
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Button
                    fullWidth
                    onClick={() => setOpenFoundRequestModal(true)}
                  >
                    Report Found Item
                  </Button>
                  <Button
                    color="danger"
                    fullWidth
                    onClick={() => setOpenLostRequestModal(true)}
                  >
                    Report Lost Item
                  </Button>
                </Box>
              )}
            </Box>

            <Modal
              open={openDrawer === "finders"}
              onClose={() => setOpenDrawer(null)}
              sx={{ padding: "1rem" }}
            >
              <ModalDialog>
                <ModalClose />
                <DialogContent>
                  <TopStudentsEarnedBadges users={users} session={session} />
                </DialogContent>
              </ModalDialog>
            </Modal>
            <Modal
              open={openDrawer === "sharers"}
              onClose={() => setOpenDrawer(null)}
              sx={{ padding: "1rem" }}
            >
              <ModalDialog>
                <ModalClose />
                <DialogContent>
                  <TopSharers users={users} session={session} />
                </DialogContent>
              </ModalDialog>
            </Modal>
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
                      item={post?.isFinder ? post?.finder : post?.owner}
                      createdAt={post.createdAt}
                      isXs={isXs}
                      lostItems={lostItems}
                      roleColors={roleColors}
                    />
                  )}
                </div>
              );
            })}

            {loadingMore && (
              <Card sx={{ width: "100%", mb: 2 }}>
                <CardHeader
                  avatar={
                    <Skeleton
                      animation="wave"
                      variant="circular"
                      width={40}
                      height={40}
                    />
                  }
                  title={<Skeleton animation="wave" height={10} width="80%" />}
                  subheader={
                    <Skeleton animation="wave" height={10} width="40%" />
                  }
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Skeleton animation="wave" height={10} sx={{ mb: 1 }} />
                    <Skeleton animation="wave" height={10} width="80%" />
                  </Box>
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    height={300}
                  />
                </CardContent>
                <CardActions sx={{ px: 2 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Skeleton animation="wave" height={36} width={100} />
                  </Box>
                </CardActions>
              </Card>
            )}
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
            {hasMore && !loadingMore && posts.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button onClick={() => fetchPosts(searchQuery)}>
                  Load More
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
        {!isMd && (
          <Grid item md={4.2}>
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
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Button
                  fullWidth
                  onClick={() => setOpenFoundRequestModal(true)}
                >
                  Report Found Item
                </Button>
                <Button
                  color="danger"
                  fullWidth
                  onClick={() => setOpenLostRequestModal(true)}
                >
                  Report Lost Item
                </Button>
              </Box>
              {birthdayToday.length !== 0 && (
                <Box sx={{ marginBottom: "16px" }}>
                  <Typography level="h3" gutterBottom>
                    Birthdays
                  </Typography>
                  <Card
                    sx={{
                      height: "auto",
                      borderTop: "3px solid #3f51b5",
                      fontSize: "0.875rem",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      padding: "16px",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      borderRadius: "8px",
                    }}
                  >
                    {/* Birthday Icon */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#FF4081",
                        color: "#fff",
                        width: "60px",
                        height: "50px",
                        borderRadius: "50%",
                        marginBottom: "16px", // Space between icon and content
                        fontSize: "24px",
                      }}
                    >
                      🎂
                    </Box>

                    {/* Birthday Content */}
                    <Box sx={{ width: "100%" }}>
                      {/* Conditional Message for Users */}
                      <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                        {birthdayToday.length === 1
                          ? `${birthdayToday[0].firstname} ${birthdayToday[0].lastname}'s birthday is today! 🎉`
                          : users.length === 2
                          ? `${birthdayToday[0].firstname} ${birthdayToday[0].lastname} and ${birthdayToday[1].firstname} ${birthdayToday[1].lastname}'s birthday is today! 🎉`
                          : `${birthdayToday[0].firstname} ${
                              birthdayToday[0].lastname
                            } and ${
                              birthdayToday.length - 1
                            } others' birthday is today! 🎉`}
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              )}
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
              >
                <TopStudentsEarnedBadges users={users} session={session} />
                <TopSharers users={users} session={session} />
              </Box>
            </Box>
          </Grid>
        )}
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
