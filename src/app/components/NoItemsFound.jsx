"use client";
import React from "react";
import { Box, Typography } from "@mui/joy";
import { FindInPage } from "@mui/icons-material";

const NoItemsFoundUI = () => (
  <Box
    sx={{
      textAlign: "center",
      p: 3,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 2,
      boxShadow: 3,
    }}
  >
    <FindInPage sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
    <Typography
      color="text.primary"
      sx={{ fontSize: "1.4rem", fontWeight: "bold", mb: 1 }}
    >
      No Items Found
    </Typography>
    <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
      Try refining your search or browse the news feed to see other lost & found
      items.
    </Typography>
  </Box>
);

export default NoItemsFoundUI;
