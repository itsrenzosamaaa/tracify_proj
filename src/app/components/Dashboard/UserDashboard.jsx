"use client";

import React from "react";
import { Box, Grid, Paper, useTheme, useMediaQuery } from "@mui/material";
import { Typography } from "@mui/joy";
import Link from "next/link";
import TopStudentsEarnedBadges from "../TopStudentsEarnedBadges";
import TopSharers from "../TopSharers";

const UserDashboard = ({ session, users }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Grid container spacing={2}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Box sx={{ padding: "1rem", maxWidth: "100%" }}>
            <Typography
              level="h4"
              gutterBottom
              sx={{
                display: { xs: "block", sm: "none", md: "none", lg: "none" },
              }}
            >
              Welcome back, {session.user.firstname}!
            </Typography>
            <Typography
              level="h3"
              gutterBottom
              sx={{
                display: { xs: "none", sm: "block", md: "block", lg: "none" },
              }}
            >
              Welcome back, {session.user.firstname}!
            </Typography>
            <Typography
              level="h2"
              gutterBottom
              sx={{
                display: { xs: "none", sm: "none", md: "none", lg: "block" },
              }}
            >
              Welcome back, {session.user.firstname}!
            </Typography>
            <Typography>Dashboard Overview</Typography>
          </Box>
        </Grid>

        {/* Top Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2} justifyContent="center">
            {[
              session.user.permissions.includes("Browse Found Corner") && {
                title: "Found Corner",
                description: "Browse found items here",
                href: "/found-corner",
                bgColor: "#1e88e5",
                hoverColor: "#1565c0",
                textColor: "#bbdefb",
              },
              session.user.permissions.includes("Browse Lost Corner") && {
                title: "Lost Corner",
                description: "Browse lost items here",
                href: "/lost-corner",
                bgColor: "#e53935",
                hoverColor: "#b71c1c",
                textColor: "#ff8a80",
              },
              session.user.permissions.includes("View My Items") && {
                title: "My Items",
                description: "View your monitored items here",
                href: "/item-retrieval",
                bgColor: "#43a047",
                hoverColor: "#2e7d32",
                textColor: "#a5d6a7",
              },
            ]
              .filter(Boolean) // Remove null values (cards that don't meet permission conditions)
              .map((card, index, array) => (
                <Grid
                  item
                  key={index}
                  xs={12}
                  md={Math.floor(12 / array.length)} // Auto-size based on available cards
                >
                  <Paper
                    component={Link}
                    href={card.href}
                    elevation={3}
                    sx={{
                      backgroundColor: card.bgColor,
                      color: "#fff",
                      textDecoration: "none",
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: card.hoverColor,
                        transform: "translateY(-4px)",
                        transition: "0.3s ease-in-out",
                      },
                    }}
                  >
                    <Typography
                      level={isXs ? "title-md" : "title-lg"}
                      sx={{ color: "#fff", paddingTop: 2 }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      level="body-xs"
                      sx={{ color: "#fff", paddingBottom: 2 }}
                    >
                      {card.description}
                    </Typography>
                    <Box
                      sx={{
                        marginTop: "auto",
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          color: card.textColor,
                        }}
                      >
                        More info &rarr;
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          lg={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <TopStudentsEarnedBadges users={users} session={session} />
        </Grid>
        <Grid
          item
          xs={12}
          lg={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <TopSharers users={users} session={session} />
        </Grid>
      </Grid>
    </>
  );
};

export default UserDashboard;
