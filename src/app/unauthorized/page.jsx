"use client";

import { Box, Button, Typography } from "@mui/joy";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useRouter } from "next/navigation";
import React from "react";

const Unauthorized = () => {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "90vh",
        textAlign: "center",
        padding: 2,
      }}
    >
      <LockOutlinedIcon
        sx={{ fontSize: 50, marginBottom: 2, color: "primary.main" }}
      />
      <Typography level="h4" sx={{ marginBottom: 2 }}>
        Oops! It looks like you tried to access a restricted page.
      </Typography>
      <Typography sx={{ marginBottom: 3 }}>
        You don&apos;t have permission to view this page. Please go back to the
        previous page and try again.
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          onClick={() => router.back()}
          variant="solid"
          color="primary"
          sx={{ fontSize: "1rem", px: 4, py: 1 }}
        >
          Go Back
        </Button>
        <Button
          component="a"
          href="/dashboard"
          variant="outlined"
          color="neutral"
          sx={{ fontSize: "1rem", px: 4, py: 1 }}
        >
          Home
        </Button>
      </Box>
    </Box>
  );
};

export default Unauthorized;
