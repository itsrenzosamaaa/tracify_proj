import NotificationsIcon from "@mui/icons-material/Notifications";
import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import Menu from "@mui/joy/Menu";
import IconButton from "@mui/joy/IconButton";
import MenuItem from "@mui/joy/MenuItem";
import { Avatar, Badge } from "@mui/joy";
import { Box, Typography, Divider, CircularProgress } from "@mui/joy";
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
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch notifications from the server
  const fetchNotifications = useCallback(async () => {
    // Only proceed if we have a valid session and user ID
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/notification/${session.user.id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const sortedNotifications = data.sort(
        (a, b) => new Date(b.dateNotified) - new Date(a.dateNotified)
      );

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/notification/${session.user.id}/read-all`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            markAsRead: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          markAsRead: true,
        }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [session?.user?.id]);

  const handleOpen = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // Initial fetch and polling setup
  useEffect(() => {
    if (status === "authenticated" && session.user.userType === "user") {
      // Initial fetch
      fetchNotifications();

      // Setup polling every minute
      const pollInterval = setInterval(fetchNotifications, 60000);

      // Cleanup function
      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [status, session?.user?.userType, fetchNotifications]);

  // Count unread notifications
  const unreadCount = notifications.filter(
    (notification) => !notification.markAsRead
  ).length;

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
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
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
            <NotificationsIcon
              sx={{
                fontSize: { xs: 25, md: 35 },
                color: "inherit",
                transition: "color 0.2s",
              }}
            />
          </Badge>
        </MenuButton>
        <Menu
          placement="bottom-end"
          sx={{
            width: 300, // Set a fixed width if needed
            height: 400, // Fixed height for the menu
            overflowY: "auto", // Enable vertical scrolling for overflowing content
            overflowX: "hidden", // Prevent horizontal scrolling
            borderRadius: "sm",
            boxShadow: "md",
            mt: 1, // Margin top to position it below the button
          }}
        >
          <Typography
            level="h3"
            sx={{
              padding: "1rem",
              position: "sticky", // Make the title sticky
              top: 0, // Stick to the top of the menu
              backgroundColor: "white", // Ensure the title has a background to overlay the content
              zIndex: 1, // Make sure it stays on top of the content
              borderTopLeftRadius: "sm", // Optional: add rounded corners to the top
              borderTopRightRadius: "sm", // Optional: add rounded corners to the top
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
                      notification.type === "Found Items"
                        ? router.push("/my-items#found-item")
                        : notification.type === "Lost Items"
                        ? router.push("/my-items#lost-item")
                        : notification.type === "Declined Items"
                        ? router.push("/my-items#declined-item")
                        : notification.type === "Shared Post"
                        ? router.push("#shared-post")
                        : router.push("/profile");
                    }}
                  >
                    <Box>
                      <Typography level="body2">
                        {notification.message}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          level="body-xs"
                          sx={{ color: "neutral.500", mt: 0.5 }}
                        >
                          {formatDistanceToNow(
                            new Date(notification.dateNotified),
                            { addSuffix: true }
                          )}
                        </Typography>
                        <Typography
                          level="body-xs"
                          sx={{
                            color: "neutral.500",
                            mt: 0.5,
                            textDecoration: "underline",
                          }}
                        >
                          Redirect here
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <Divider />
                </React.Fragment>
              ))}
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
