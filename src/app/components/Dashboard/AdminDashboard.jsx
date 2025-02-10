"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Typography } from "@mui/joy";
import dynamic from "next/dynamic";
import Link from "next/link";
import TopStudentsEarnedBadges from "../TopStudentsEarnedBadges";
import PublishFoundItem from "../Modal/PublishFoundItem";
import PublishLostItem from "../Modal/PublishLostItems";
import { MoreHoriz } from "@mui/icons-material";
import TopSharers from "../TopSharers";

const AdminDashboard = ({ session, users }) => {
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
              session.user.permissions.includes("Manage Items") && {
                title: "Found Items",
                description: "View your monitored found items here",
                href: "/found-items",
                bgColor: "#1e88e5",
                hoverColor: "#1565c0",
                textColor: "#bbdefb",
              },
              session.user.permissions.includes("Manage Items") && {
                title: "Lost Items",
                description: "View your monitored lost items here",
                href: "/lost-items",
                bgColor: "#e53935",
                hoverColor: "#b71c1c",
                textColor: "#ff8a80",
              },
              session.user.permissions.includes("Manage Item Retrievals") && {
                title: "Resolved Items",
                description: "View your resolved items here",
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

export default AdminDashboard;
