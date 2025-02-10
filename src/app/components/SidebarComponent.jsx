"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import { useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AvatarComponent from "./AvatarComponent";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Typography, Input, Button } from "@mui/joy";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { LinearProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import Loading from "./Loading";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LuggageIcon from "@mui/icons-material/Luggage";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import LinkIcon from "@mui/icons-material/Link";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import StarRateIcon from "@mui/icons-material/StarRate";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NotificationComponent from "./NotificationComponent";
import { LocationOnOutlined } from "@mui/icons-material";

// Updated Styled Link
const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  &:hover {
    color: #fff;
  }
`;

// Sidebar Container with dynamic width for desktop
const SidebarContainer = styled(Box)(({ collapsed }) => ({
  width: collapsed ? "60px" : "250px",
  height: "100vh",
  backgroundColor: "#fff",
  position: "fixed",
  top: 0,
  left: 0,
  boxShadow: "2px 0 5px rgba(0, 0, 0, 0.2)",
  display: "none",
  transition: "width 0.3s ease",
  "@media (min-width: 1200px)": {
    display: "block",
  },
  "@media (max-width: 600px)": {
    width: collapsed ? "0px" : "250px", // Fully hide sidebar when collapsed on mobile
  },
}));

// Sidebar Header
const SidebarHeader = styled(Box)`
  height: 50px;
  padding: 16px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  color: #fff;
  justify-content: space-between;
`;

// Sidebar Item Styles
// Sidebar Item Styles (with selected state)
const SidebarItem = styled(ListItem)`
  &.Mui-selected {
    background-color: #3d5afe; /* Background color when selected */
    color: #fff; /* Text color when selected */

    & .MuiListItemText-primary {
      color: #fff; /* Text color when selected */
    }

    & .MuiListItemIcon-root {
      color: #fff; /* Icon color when selected */
    }
  }

  &:hover {
    background-color: #3d5afe; /* Change background color on hover */
    transform: scale(1.05); /* Scale effect on hover */
    transition: transform 0.2s ease, background-color 0.2s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    color: #fff;

    & .MuiListItemText-primary {
      color: #fff;
    }

    & .MuiListItemIcon-root {
      color: #fff;
    }
  }

  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

// Icon Item Styles (for selected state as well)
const IconItem = styled(ListItemIcon)`
  &.Mui-selected {
    color: #fff; /* Icon color when selected */
  }

  &:hover {
    color: #fff; /* Icon color on hover */
    transform: scale(1.2);
    transition: color 0.2s ease, transform 0.2s ease;
  }
`;

// Header styles
const Header = styled(Box)(({ collapsed }) => ({
  height: "60px",
  backgroundColor: "#3d5afe",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  position: "fixed",
  top: 0,
  right: 0,
  zIndex: 1200,
  width: "100%",
  transition: "left 0.3s ease",
  "@media (min-width: 1200px)": {
    left: collapsed ? "60px" : "250px",
    width: collapsed ? "calc(100% - 60px)" : "calc(100% - 250px)",
  },
  "@media (max-width: 600px)": {
    height: "48px", // Shorter height for mobile devices
    left: 0,
  },
}));

// Main App Component
export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const fetchProfile = useCallback(async (accountId) => {
    try {
      const response = await fetch(`/api/users/${accountId}`);
      const data = await response.json();
      if (response.ok) setProfile(data);
      else console.error("Failed to fetch user data:", data.message);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchProfile(session.user.id);
    }
  }, [status, session?.user?.id, session?.user?.userType, fetchProfile]);

  const userPermissions = useMemo(
    () => session?.user?.permissions || {},
    [session?.user?.permissions]
  );

  const navigation = useMemo(() => {
    const base = [{ icon: <HomeIcon />, menu: "Home", url: "/dashboard" }];
    if (status === "authenticated") {
      if (userPermissions.includes("View Profile")) {
        base.push({
          icon: <AccountCircleIcon />,
          menu: "Profile",
          url: "/profile",
        });
      }
      if (userPermissions.includes("View My Items")) {
        base.push({
          icon: <LuggageIcon />,
          menu: "My Items",
          url: "/my-items",
        });
      }
      if (userPermissions.includes("Manage Items")) {
        base.push(
          {
            icon: <FindInPageIcon />,
            menu: "Found Items",
            url: "/found-items",
          },
          {
            icon: <HelpOutlineIcon />,
            menu: "Lost Items",
            url: "/lost-items",
          }
        );
      }
      if (userPermissions.includes("Manage Item Retrievals")) {
        base.push({
          icon: <MoveToInboxIcon />,
          menu: "Item Retrieval",
          url: "/item-retrieval",
        });
      }
      if (userPermissions.includes("View Locations")) {
        base.push({
          icon: <LocationOnOutlined />,
          menu: "Locations",
          url: "/locations",
        });
      }
      if (userPermissions.includes("Manage Roles")) {
        base.push({
          icon: <SecurityIcon />,
          menu: "Role",
          url: "/role",
        });
      }
      if (userPermissions.includes("Manage Users")) {
        base.push({
          icon: <PeopleOutlineIcon />,
          menu: "Users",
          url: "/users",
        });
      }
    }
    return base;
  }, [status, userPermissions]);

  const toggleMobileDrawer = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  const handleNavigation = useCallback(
    (url) => {
      try {
        setLoading(true);
        router.push(url);
      } catch (error) {
        console.error("Navigation failed:", error);
        setLoading(false);
      }
    },
    [router]
  );

  const DrawerContent = ({ navigation, toggleMobileDrawer, collapsed }) => (
    <Box role="presentation">
      {status === "loading" ? (
        <Loading />
      ) : (
        <>
          <SidebarHeader>
            {!collapsed && (
              <Image
                priority
                width={150}
                height={150}
                src="/tracify.png"
                alt="tracify"
              />
            )}
            <IconButton
              sx={{ display: { xs: "block", lg: "none" } }}
              onClick={(e) => {
                e.stopPropagation();
                toggleMobileDrawer();
              }}
            >
              <CloseIcon />
            </IconButton>
          </SidebarHeader>
          <Divider />
          <List>
            {navigation.map((item, index) => (
              <StyledLink
                href={item.url}
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.url);
                  if (isMobile) toggleMobileDrawer();
                }}
              >
                <SidebarItem selected={pathname === item.url} disablePadding>
                  <ListItemButton>
                    <IconItem>{item.icon}</IconItem>
                    {!collapsed && <ListItemText primary={item.menu} />}
                  </ListItemButton>
                </SidebarItem>
              </StyledLink>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      {loading && (
        <LinearProgress
          color="info"
          sx={{
            height: "4px",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 9999,
          }}
        />
      )}

      <Header collapsed={collapsed}>
        <IconButton
          color="inherit"
          onClick={toggleMobileDrawer}
          variant="outlined"
          sx={{
            display: { xs: "block", lg: "none" },
            marginX: 2,
            position: "absolute",
            left: 0,
            zIndex: 1201,
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          sx={{
            marginLeft: { xs: "48px", lg: "0" }, // Leave space for menu icon on mobile
            flex: 1,
            height: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Notification for Users */}
          {session?.user?.permissions.includes("View Notifications") && (
            <NotificationComponent session={session} status={status} />
          )}

          {/* Avatar */}
          <AvatarComponent profile={profile} session={session} />
        </Box>
      </Header>

      <SidebarContainer collapsed={collapsed}>
        <DrawerContent
          navigation={navigation}
          toggleMobileDrawer={toggleMobileDrawer}
          collapsed={collapsed}
        />
      </SidebarContainer>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleMobileDrawer}
        ModalProps={{ keepMounted: true, disableRestoreFocus: true }}
        sx={{ display: { xs: "block", lg: "none" } }}
      >
        <DrawerContent
          navigation={navigation}
          toggleMobileDrawer={toggleMobileDrawer}
          collapsed={collapsed}
        />
      </Drawer>
    </>
  );
}
