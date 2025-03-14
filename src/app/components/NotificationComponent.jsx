import React, { useState, useCallback, useEffect, useRef } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import styled from "styled-components";
import {
  Badge,
  Box,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from "@mui/joy";
import IconButton from "@mui/joy/IconButton";
import Dropdown from "@mui/joy/Dropdown";
import MenuButton from "@mui/joy/MenuButton";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const NotificationComponent = ({ status, session }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const router = useRouter();
  const LIMIT = 10;

  const fetchNotifications = useCallback(
    async (reset = false) => {
      if (!session?.user?.id) return;

      const currentPage = reset ? 1 : pageRef.current;
      try {
        if (reset) {
          setIsLoading(true);
          setHasMore(true);
          pageRef.current = 1;
        } else {
          setIsFetchingMore(true);
        }

        const response = await fetch(
          `/api/notification/${session.user.id}?page=${currentPage}&limit=${LIMIT}`
        );
        const data = await response.json();

        if (!Array.isArray(data)) throw new Error("Invalid data");

        if (reset) {
          setNotifications(data);
        } else {
          setNotifications((prev) => {
            const unique = new Map();
            [...prev, ...data].forEach((item) => unique.set(item._id, item));
            return Array.from(unique.values());
          });
        }

        pageRef.current += 1;
        if (data.length < LIMIT) setHasMore(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load notifications");
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [session?.user?.id]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/notification/${session.user.id}/read-all`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Failed to mark as read");

      setNotifications((prev) => prev.map((n) => ({ ...n, markAsRead: true })));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  }, [session?.user?.id]);

  const handleOpen = () => {
    markAllAsRead();
    fetchNotifications(true);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications(true);
      const interval = setInterval(() => fetchNotifications(true), 60000);
      return () => clearInterval(interval);
    }
  }, [status, fetchNotifications]);

  // 👇 Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading || isFetchingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNotifications();
        }
      },
      { root: null, rootMargin: "0px", threshold: 1.0 }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [fetchNotifications, hasMore, isLoading, isFetchingMore]);

  const unreadCount = notifications.filter((n) => !n.markAsRead).length;

  return (
    <DropdownContainer>
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{
            root: {
              variant: "plain",
              color: "neutral",
              sx: {
                color: "white",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              },
            },
          }}
          onClick={handleOpen}
        >
          <Badge
            badgeContent={unreadCount}
            color="danger"
            variant="solid"
            size="sm"
          >
            <NotificationsIcon sx={{ fontSize: { xs: 25, md: 35 } }} />
          </Badge>
        </MenuButton>

        <Menu
          sx={{
            width: 300,
            height: 400,
            overflowY: "auto",
            overflowX: "hidden",
            borderRadius: "sm",
            boxShadow: "md",
            mt: 1,
          }}
        >
          <Typography
            level="h3"
            sx={{
              padding: "1rem",
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: 1,
            }}
          >
            Notifications
          </Typography>
          <Divider />
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size="sm" />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography level="body2" color="danger">
                {error}
              </Typography>
            </Box>
          ) : notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <React.Fragment key={notification._id}>
                  <MenuItem
                    sx={{
                      display: "block",
                      textAlign: "left",
                      whiteSpace: "normal",
                      px: 2,
                      py: 1.5,
                      backgroundColor: notification.markAsRead
                        ? "neutral.100"
                        : "neutral.50",
                      "&:hover": {
                        backgroundColor: notification.markAsRead
                          ? "neutral.200"
                          : "neutral.100",
                      },
                    }}
                    onClick={() => {
                      if (notification.type === "Found Items")
                        router.push("/my-items#found-item");
                      else if (notification.type === "Lost Items")
                        router.push("/my-items#lost-item");
                      else if (notification.type === "Declined Items")
                        router.push("/my-items#declined-item");
                      else if (notification.type === "Shared Post")
                        router.push(`/shared-post/${notification?.post}`);
                      else router.push("/profile");
                    }}
                  >
                    <Typography level="body2">
                      {notification.message}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 0.5,
                      }}
                    >
                      <Typography level="body-xs" color="neutral.500">
                        {formatDistanceToNow(
                          new Date(notification.dateNotified),
                          { addSuffix: true }
                        )}
                      </Typography>
                      <Typography
                        level="body-xs"
                        sx={{ textDecoration: "underline" }}
                      >
                        Redirect here
                      </Typography>
                    </Box>
                  </MenuItem>
                  <Divider />
                </React.Fragment>
              ))}

              {/* 👇 Intersection Observer target */}
              <div ref={sentinelRef} style={{ height: 1 }}></div>

              {isFetchingMore && (
                <Box sx={{ textAlign: "center", py: 1 }}>
                  <CircularProgress size="sm" />
                </Box>
              )}
              {!hasMore && (
                <Typography sx={{ textAlign: "center", p: 1 }}>
                  No more notifications.
                </Typography>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography level="body2" color="neutral.500">
                No new notifications
              </Typography>
            </Box>
          )}
        </Menu>
      </Dropdown>
    </DropdownContainer>
  );
};

export default NotificationComponent;
