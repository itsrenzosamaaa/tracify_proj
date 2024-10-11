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
import SearchIcon from '@mui/icons-material/Search';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';

// Updated Styled Link
const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  &:hover {
    color: #fff;
  }
`;

// Sidebar Container with dynamic width
const SidebarContainer = styled(Box)`
  width: ${({ collapsed }) => (collapsed ? "80px" : "250px")};
  height: 100%;
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
  height: 28px;
  padding: 16px;
  background-color: #1a237e;
  display: flex;
  align-items: center;
  color: #fff;
  justify-content: space-between;
`;

// Sidebar Item Styles
const SidebarItem = styled(ListItem)`
  &:hover {
    background-color: #3d5afe;
    transform: scale(1.05);
    transition: transform 0.2s ease, background-color 0.2s ease;
  }
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

// Icon styles
const IconContainer = styled(ListItemIcon)`
  color: #000000;
`;

// Header styles
const Header = styled(Box)`
  height: 60px;
  background-color: #1a237e;
  color: #fff;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1200;
  transition: width 0.3s ease;
  @media (min-width: 1199px) {
    width: ${({ collapsed }) => (collapsed ? "calc(100% - 80px)" : "calc(100% - 250px)")};
  }
  @media (max-width: 1199px) {
    width: 100%;
    padding: 0 0px;
    height: 50px;
  }
`;

export default function App({ arr, avtr }) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const getData = arr.find(
      (list) => search.toLowerCase() === list.menu.toLowerCase()
    );
    if (getData) {
      router.push(getData.url);
    } else {
      alert("No match found");
    }
    setSearch("");
  };

  const DrawerContent = ({ arr, toggleDrawer, collapsed }) => {
    const pathname = usePathname();

    return (
      <Box role="presentation">
        <SidebarHeader>
          {!collapsed && <h2>Tracify</h2>}
          <IconButton onClick={toggleDesktopDrawer} sx={{ color: 'inherit' }}>
            {collapsed ? <MenuIcon /> : <CloseIcon onClick={toggleMobileDrawer} />}
          </IconButton>
        </SidebarHeader>
        <Divider />
        <List>
          {arr.map((item, index) => (
            <StyledLink href={item.url} key={index}>
              <SidebarItem selected={pathname === item.url} disablePadding>
                <ListItemButton>
                  <IconContainer selected={pathname === item.url}>
                    {item.icon}
                  </IconContainer>
                  {!collapsed && <ListItemText primary={item.menu} />}
                </ListItemButton>
              </SidebarItem>
            </StyledLink>
          ))}
        </List>
      </Box>
    );
  };

  const toggleDesktopDrawer = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div>
      {/* Header */}
      <Header collapsed={collapsed}>
        <IconButton
          onClick={toggleMobileDrawer}
          variant="outlined"
          color="inherit"
          sx={{ display: { xs: "block", lg: "none" }, marginX: 2 }}
        >
          <MenuIcon />
        </IconButton>
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
        <Box sx={{ flex: 1 }} />
        <AvatarComponent role={avtr} />
      </Header>

      {/* Fixed Sidebar for Desktop */}
      <SidebarContainer collapsed={collapsed}>
        <DrawerContent arr={arr} onClose={toggleDesktopDrawer} collapsed={collapsed} />
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
        <DrawerContent arr={arr} toggleDrawer={toggleMobileDrawer} collapsed={false} />
      </Drawer>
    </div>
  );
}
