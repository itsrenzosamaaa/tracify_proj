'use client'

import React from "react";
import SidebarComponent from "../components/SidebarComponent";
import { Box, Typography } from "@mui/joy";
import styled from "styled-components";

const Footer = styled(Box)`
  height: 60px,
  backgroundColor: #fff,
  color: #fff,
  display: flex,
  alignItems: center,
  justifyContent: center, // Center the content
  position: fixed,
  bottom: 0,
  right: 0,
  zIndex: 1200,
  width: 100%,
  padding: 0 20px,
  transition: all 0.3s ease,
  boxShadow: 0 -2px 5px rgba(0, 0, 0, 0.1), // Add subtle shadow
  '@media (max-width: 600px)': {
    height: 48px,
    left: 0,
    width: 100%,
  },
`;

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <title>Dashboard</title>
      </head>
      <body style={{ backgroundColor: "whitesmoke", }}>
        <SidebarComponent />
        <Box
          sx={{
            marginTop: '60px',
            marginLeft: { xs: '0px', lg: '250px' },
            padding: { xs: '4px', md: '20px' },
            transition: 'margin-left 0.3s ease',
          }}
        >
          {children}
        </Box>
        <Footer>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}>
            <Typography level="body-sm">
              © 2024 Tracify. All rights reserved.
            </Typography>
          </Box>
        </Footer>
      </body>
    </html>
  );
}
