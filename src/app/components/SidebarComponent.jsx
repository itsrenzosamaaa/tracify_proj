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
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AvatarComponent from "./AvatarComponent";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Typography, Input, Button } from "@mui/joy";
import SearchIcon from '@mui/icons-material/Search';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;

  &:hover {
    text-decoration: none;
    color: #FFFFFF;
  }
`;

// Sidebar Container for Desktop
const SidebarContainer = styled(Box)`
  width: 250px;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  display: none;
  background-color: #f5f5f5;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);

  @media (min-width: 1200px) {
    display: block; /* Display for large screens */
  }
`;

// Styled Header - Sticks to the sidebar when visible
const Header = styled(Box)`
  height: 60px;
  background-color: #3f51b5;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1200;
  transition: width 0.3s ease;

  @media (min-width: 1199px) {
    width: calc(100% - 290px); /* Adjust width to account for sidebar */
  }

  @media (max-width: 1199px) {
    width: 100%; /* Full width on small screens */
    height: 50px;
    padding: 0 10px;
    h1 {
      font-size: 1.2rem;
      padding-left: 4rem;
    }
    svg {
      font-size: 1.5rem;
    }
  }
`;

export default function App({ arr, avtr }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = (e) => {
    e.preventDefault();

    const getData = arr.find(
      (list) => search.toLowerCase() === list.menu.toLowerCase()
    );

    if(getData){
      router.push(getData.url);
    } else {
      alert('No match found');
    }

    setSearch('');
  };

  console.log(search);

  const DrawerContent = ({ arr, toggleDrawer }) => (
    <Box sx={{ width: 250 }} role="presentation">
      <Box
        sx={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Tracify</h2>
        <IconButton
          sx={{ display: { xs: "block", lg: "none" } }}
          onClick={toggleDrawer(false)}
          color="inherit"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {arr.map((item, index) => (
          <StyledLink href={item.url} key={index} onClick={toggleDrawer(false)}>
            <ListItem sx={{
              backgroundColor: pathname === item.url ? "#2196f3" : "",
              '&:hover': {
                backgroundColor: "#1976d2",
              },
              borderRadius: '8px',
              marginBottom: '0.5rem',
            }}
              disablePadding
            >
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={item.menu}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: pathname === item.url ? 'bold' : 'normal',
                      color: pathname === item.url ? "#ffffff" : "#000000",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </StyledLink>
        ))}
      </List>
    </Box>
  );

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <div>
      {/* Header */}
      <Header>
        <IconButton
          onClick={toggleDrawer(true)}
          variant="outlined"
          color="inherit"
          sx={{
            display: { xs: "block", lg: "none" },
          }} /* Only display menu icon on mobile */
        >
          <MenuIcon sx={{ padding: "0 1.5rem 0 1.5rem" }} />
        </IconButton>
        <form onSubmit={handleSubmit}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ '--Input-decoratorChildHeight': '37px', marginLeft: { lg: "1.5rem", xs: "auto" }, width: { xs: '12rem', lg: '18rem' } }}
            startDecorator={<SearchIcon />}
            endDecorator={<Button
              type="submit"
              variant="solid"
              sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, }}
            >
              <Typography color="inherit" sx={{ display: { xs: 'none', lg: 'block' } }}>Enter</Typography>
              <Typography color="inherit" sx={{ display: { xs: 'block', lg: 'none' } }}><KeyboardTabIcon /></Typography>
            </Button>}
          />
        </form>
        <Box sx={{ flex: 1 }} />
        <AvatarComponent role={avtr} />
      </Header>

      {/* Fixed Sidebar for Desktop */}
      <SidebarContainer>
        <DrawerContent arr={arr} toggleDrawer={toggleDrawer} />
      </SidebarContainer>

      {/* Mobile Drawer */}
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          display: {
            xs: "block",
            lg: "none",
          } /* Only display drawer on mobile */,
        }}
      >
        <DrawerContent arr={arr} toggleDrawer={toggleDrawer} />
      </Drawer>
    </div>
  );
}
