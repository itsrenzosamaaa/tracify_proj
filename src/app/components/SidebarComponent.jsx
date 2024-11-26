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
import NotificationComponent from "./NotificationComponent";

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
  width: collapsed ? '60px' : '250px',
  height: '100vh',
  backgroundColor: '#fff',
  position: 'fixed',
  top: 0,
  left: 0,
  boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)',
  display: 'none',
  transition: 'width 0.3s ease',
  '@media (min-width: 1200px)': {
    display: 'block',
  },
}));


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
const Header = styled(Box)(({ collapsed }) => ({
  height: '60px',
  backgroundColor: '#3d5afe',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  position: 'fixed',
  top: 0,
  right: 0,
  zIndex: 1200,
  width: '100%',
  transition: 'left 0.3s ease',
  '@media (min-width: 1200px)': {
    left: collapsed ? '60px' : '250px',
  },
}));


// Main App Component
export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const fetchProfile = useCallback(async (accountId) => {
    try {
      const response = await fetch(`/api/users/${accountId}`);
      const data = await response.json();
      if (response.ok) setProfile(data);
      else console.error('Failed to fetch user data:', data.message);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && session?.user?.userType === 'user') {
      fetchProfile(session.user.id);
    }
  }, [status, session?.user?.id, session?.user?.userType, fetchProfile]);


  const userType = session?.user?.userType || '';
  const userPermissions = useMemo(() => session?.user?.permissions || {}, [session?.user?.permissions]);

  const navigation = useMemo(() => {
    const base = [{ icon: <HomeIcon />, menu: 'Home', url: '/dashboard' }];
    if (status === "authenticated") {
      if (userType === 'user') {
        base.push({ icon: <AccountCircleIcon />, menu: 'Profile', url: '/profile' });
        base.push({ icon: <LuggageIcon />, menu: 'My Items', url: '/my-items' });
      } else {
        if (userPermissions.manageRequestReportedFoundItems) base.push({ icon: <FindInPageIcon />, menu: 'Found Items', url: '/found-items' });
        if (userPermissions.manageRequestItemRetrieval) base.push({ icon: <MoveToInboxIcon />, menu: 'Item Retrieval', url: '/item-retrieval' });
        if (userPermissions.manageRequestReportedLostItems) base.push({ icon: <HelpOutlineIcon />, menu: 'Lost Items', url: '/lost-items' });
        if (userPermissions.viewItemHistory) base.push({ icon: <HistoryIcon />, menu: 'Item History', url: '/item-history' });
        if (userPermissions.viewBadges) base.push({ icon: <EmojiEventsOutlinedIcon />, menu: 'Badges', url: '/badges' });
        if (userPermissions.viewRoles) base.push({ icon: <SecurityIcon />, menu: 'Roles', url: '/roles' });
        if (userPermissions.viewAdminsList) base.push({ icon: <PeopleOutlineIcon />, menu: 'Admin', url: '/admin' });
        if (userPermissions.viewStudentsList) base.push({ icon: <PeopleOutlineIcon />, menu: 'Users', url: '/users' });
      }
    }
    return base;
  }, [status, userType, userPermissions]);

  const toggleMobileDrawer = () => setMobileOpen(!mobileOpen);

  if (status === 'loading') return <Loading />;

  const DrawerContent = ({ navigation, toggleMobileDrawer, collapsed }) => {
    const pathname = usePathname();

    return (
      <Box role="presentation">
        <SidebarHeader>
          {!collapsed && <Image priority width="150" height="150" src="/tracify_logo.png" alt="tracify" />}
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

  return (
    <div>
      <Header collapsed={collapsed}>
        <IconButton
          color="inherit"
          onClick={toggleMobileDrawer}
          variant="outlined"
          sx={{ display: { xs: "block", lg: "none" }, marginX: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Box
          sx={{
            width: { xs: '85%', md: '87%', lg: '82.5%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Box sx={{ display: 'flex' }}>
            {userType === 'user' && <NotificationComponent session={session} status={status} />}
            <AvatarComponent profile={profile} />
          </Box>
        </Box>
      </Header>
      <SidebarContainer collapsed={collapsed}>
        <DrawerContent navigation={navigation} toggleMobileDrawer={toggleMobileDrawer} collapsed={collapsed} />
      </SidebarContainer>
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleMobileDrawer}
        ModalProps={{ keepMounted: true, disableRestoreFocus: true }}
        sx={{ display: { xs: "block", lg: "none" } }}
      >
        <DrawerContent navigation={navigation} toggleMobileDrawer={toggleMobileDrawer} collapsed={collapsed} />
      </Drawer>
    </div>
  );
}
