"use client";
import React from "react";
import { Box, Typography } from "@mui/joy";

const NoMoreSearchResultsUI = () => (
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
      No more posts for this search...
    </Typography>
  </Box>
);

export default NoMoreSearchResultsUI;
