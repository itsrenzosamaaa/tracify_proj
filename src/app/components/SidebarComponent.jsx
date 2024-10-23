"use client";

import React, { useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AvatarComponent from "./AvatarComponent";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Typography, Input, Button } from "@mui/joy";
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import { useSession } from "next-auth/react";
import Loading from "./Loading";
import Image from "next/image";
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LuggageIcon from '@mui/icons-material/Luggage';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import LinkIcon from '@mui/icons-material/Link';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import StarRateIcon from '@mui/icons-material/StarRate';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
const SidebarContainer = styled(Box)`
  width: 250px;
  height: 100vh;
  background-color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  display: none;
  @media (min-width: 1200px) {
    display: block;
  }
  transition: width 0.3s ease;
`;

// Sidebar Header
const SidebarHeader = styled(Box)`
  height: 50px;
  padding: 16px;
  background-color: #FFFFFF;
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
const Header = styled(Box)`
  height: 60px;
  background-color: #3d5afe;
  color: #fff;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1200;
  width: 100%;
  transition: left 0.3s ease;
  @media (min-width: 1200px) {
    left: 250px;
  }
`;

// Main App Component
export default function App() {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  let navigation = [{ icon: <HomeIcon />, menu: 'Home', url: '/dashboard' }];

  // Handling authenticated session and adding routes
  if (status === "authenticated") {
    if (session?.user?.userType === 'student') {
      navigation.push({ icon: <AccountCircleIcon />, menu: 'Profile', url: '/profile' });
      navigation.push({ icon: <LuggageIcon />, menu: 'My Items', url: '/my-items' });
      navigation.push({ icon: <LinkIcon />, menu: 'Match Items', url: '/match-items' });
      navigation.push({ icon: <StarRateIcon />, menu: 'Ratings', url: '/ratings' });
    } else {
      // Check role-based permissions for non-students
      const roleData = session?.user?.permissions;

      if (roleData?.manageRequestReportedFoundItems) {
        navigation.push({ icon: <FindInPageIcon />, menu: 'Reported Items', url: '/found-items' });
      }
      if (roleData?.manageRequestItemRetrieval) {
        navigation.push({ icon: <MoveToInboxIcon />, menu: 'Item Retrieval', url: '/item-retrieval' });
      }
      if (roleData?.manageRequestReportedLostItems) {
        navigation.push({ icon: <HelpOutlineIcon />, menu: 'Lost Items', url: '/lost-items' });
      }
      if (roleData?.viewItemHistory) {
        navigation.push({ icon: <HistoryIcon />, menu: 'Item History', url: '/item-history' });
      }
      if (roleData?.viewBadges) {
        navigation.push({ icon: <EmojiEventsOutlinedIcon />, menu: 'Badges', url: '/badges' });
      }
      if (roleData?.viewRoles) {
        navigation.push({ icon: <SecurityIcon />, menu: 'Roles', url: '/roles' });
      }
      if (roleData?.viewAdminsList) {
        navigation.push({ icon: <PeopleOutlineIcon />, menu: 'Admin Users', url: '/admin-users' });
      }
      if (roleData?.viewStudentsList) {
        navigation.push({ icon: <PeopleOutlineIcon />, menu: 'Student Users', url: '/student-users' });
      }
    }
  }

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    return router.push('/');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const getData = navigation.find(
      (list) => search.toLowerCase() === list.menu.toLowerCase()
    );
    if (getData) {
      router.push(getData.url);
    } else {
      alert("No match found");
    }
    setSearch("");
  };

  const DrawerContent = ({ navigation, toggleMobileDrawer, collapsed }) => {
    const pathname = usePathname();

    return (
      <Box role="presentation">
        <SidebarHeader>
          {!collapsed && <Image width="150" height="150" src="/tracify_logo.png" alt="tracify" />}
          <IconButton sx={{ display: { xs: 'block', lg: 'none' } }}>
            <CloseIcon onClick={toggleMobileDrawer} />
          </IconButton>
        </SidebarHeader>
        <Divider />
        <List>
          {navigation.map((item, index) => (
            <StyledLink href={item.url} key={index}>
              <SidebarItem selected={pathname === item.url} disablePadding>
                <ListItemButton>
                  <IconItem>
                    {item.icon}
                  </IconItem>
                  {!collapsed && <ListItemText primary={item.menu} />}
                </ListItemButton>
              </SidebarItem>
            </StyledLink>
          ))}
        </List>
      </Box>
    );
  };

  const toggleMobileDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div>
      {/* Header */}
      <Header collapsed={collapsed}>
        <IconButton
          color="inherit"
          onClick={toggleMobileDrawer}
          variant="outlined"
          sx={{ display: { xs: "block", lg: "none" }, marginX: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ width: { xs: '85%', lg: '80%' }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSubmit}>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: "12rem", lg: "18rem" }, marginLeft: { lg: "1.5rem" } }}
              startDecorator={<SearchIcon />}
              endDecorator={
                <Button type="submit" variant="solid">
                  <Typography color="inherit" sx={{ display: { xs: "none", lg: "block" } }}>Enter</Typography>
                  <KeyboardTabIcon sx={{ display: { xs: "block", lg: "none" } }} />
                </Button>
              }
            />
          </form>
          <AvatarComponent role={session.user.firstname} />
        </Box>
      </Header>

      {/* Fixed Sidebar for Desktop */}
      <SidebarContainer collapsed={collapsed}>
        <DrawerContent navigation={navigation} toggleMobileDrawer={toggleMobileDrawer} collapsed={collapsed} />
      </SidebarContainer>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleMobileDrawer}
        role="navigation"
        aria-label="Main Navigation Menu"
        sx={{ display: { xs: "block", lg: "none" } }}
      >
        <DrawerContent navigation={navigation} toggleMobileDrawer={toggleMobileDrawer} collapsed={collapsed} />
      </Drawer>
    </div>
  );
}
