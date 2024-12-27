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

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AdminDashboard = ({ session, users }) => {
  const [isClient, setIsClient] = useState(false);
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: { type: "line", height: 350 },
      xaxis: { categories: [] },
      stroke: { curve: "smooth" },
      yaxis: { title: { text: "Number of Lost Items" } },
    },
  });
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchLostItems = useCallback(async () => {
    try {
      const response = await fetch("/api/lost-items");
      const data = await response.json();
      const categorizedData = categorizeItemsByMonth(data);
      const months = Object.keys(categorizedData);
      const itemCounts = Object.values(categorizedData);

      setChartData((prev) => ({
        ...prev,
        series: [{ name: "Lost Items", data: itemCounts }],
        options: { ...prev.options, xaxis: { categories: months } },
      }));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    fetchLostItems();
  }, [fetchLostItems]);

  const categorizeItemsByMonth = (items) => {
    // Initialize an object to hold counts per month
    const countsByMonth = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    items.forEach((item) => {
      const month = new Date(item.dateMissing).toLocaleString("en-US", {
        month: "short",
      });
      countsByMonth[month] += 1; // Increment the count for the respective month
    });

    return countsByMonth;
  };

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
          <Grid container spacing={2}>
            {session.user.roleName !== "Super Admin" && (
              <Grid item xs={12} md={3}>
                <Paper
                  component={Link}
                  href="/found-items"
                  elevation={3}
                  sx={{
                    backgroundColor: "#1e88e5",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                      transform: "translateY(-4px)",
                      transition: "0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    level={isXs ? "title-md" : "title-lg"}
                    sx={{ color: "#fff", paddingTop: 2 }}
                  >
                    Found Items
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{ color: "#fff", paddingBottom: 2 }}
                  >
                    View your monitored found items here
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
                        color: "#bbdefb",
                      }}
                    >
                      More info &rarr;
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
            {session.user.roleName !== "Super Admin" && (
              <Grid item xs={12} md={3}>
                <Paper
                  component={Link}
                  href="/lost-items"
                  elevation={3}
                  sx={{
                    backgroundColor: "#e53935",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#b71c1c",
                      transform: "translateY(-4px)",
                      transition: "0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    level={isXs ? "title-md" : "title-lg"}
                    sx={{ color: "#fff", paddingTop: 2 }}
                  >
                    Lost Items
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{ color: "#fff", paddingBottom: 2 }}
                  >
                    View your monitored lost items here
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
                        color: "#ff8a80",
                      }}
                    >
                      More info &rarr;
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
            {session.user.roleName !== "Super Admin" && (
              <Grid item xs={12} md={3}>
                <Paper
                  component={Link}
                  href="/item-retrieval"
                  elevation={3}
                  sx={{
                    backgroundColor: "#43a047",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#2e7d32",
                      transform: "translateY(-4px)",
                      transition: "0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    level={isXs ? "title-md" : "title-lg"}
                    sx={{ color: "#fff", paddingTop: 2 }}
                  >
                    Resolved Items
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{ color: "#fff", paddingBottom: 2 }}
                  >
                    View your resolved items here
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
                        color: "#a5d6a7",
                      }}
                    >
                      More info &rarr;
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
            {session.user.roleName !== "Super Admin" && (
              <Grid item xs={12} md={3}>
                <Paper
                  component={Link}
                  href="/badges"
                  elevation={3}
                  sx={{
                    backgroundColor: "#fb8c00",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#ef6c00",
                      transform: "translateY(-4px)",
                      transition: "0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    level={isXs ? "title-md" : "title-lg"}
                    sx={{ color: "#fff", paddingTop: 2 }}
                  >
                    Badges
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{ color: "#fff", paddingBottom: 2 }}
                  >
                    View your created badges here
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
                        color: "#ffcc80",
                      }}
                    >
                      More info &rarr;
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
            {session.user.roleName === "Super Admin" && (
              <Grid item xs={12} md={4}>
                <Paper
                  component={Link}
                  href="/roles"
                  elevation={3}
                  sx={{
                    backgroundColor: "#4caf50", // Green
                    color: "#fff",
                    textDecoration: "none",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#388e3c", // Darker Green on hover
                      transform: "translateY(-4px)",
                      transition: "0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    level={isXs ? "title-md" : "title-lg"}
                    sx={{
                      color: "#fff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingTop: 2,
                    }}
                  >
                    View Roles
                  </Typography>
                  <Typography
                    level={isXs ? "body-xs" : "body-sm"}
                    sx={{
                      fontWeight: "400",
                      color: "#f1f8e9", // Light Green Text
                      lineHeight: "1.4",
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingBottom: 2,
                    }}
                  >
                    View your created roles here
                  </Typography>
                  <Box
                    sx={{
                      marginTop: "auto",
                      paddingTop: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "#c8e6c9", // Soft Green
                      }}
                    >
                      More info &rarr;
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
            {session.user.roleName === "Super Admin" && (
              <Grid item xs={12} md={4}>
                <Paper
                  component={Link}
                  href="/admin"
                  elevation={3}
                  sx={{
                    backgroundColor: "#7e57c2", // Purple
                    color: "#fff",
                    textDecoration: "none",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#5e35b1", // Darker Purple on hover
                      transform: "translateY(-4px)",
                      transition: "0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    level={isXs ? "title-md" : "title-lg"}
                    sx={{
                      color: "#fff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingTop: 2,
                    }}
                  >
                    View Admin Users
                  </Typography>
                  <Typography
                    level={isXs ? "body-xs" : "body-sm"}
                    sx={{
                      fontWeight: "400",
                      color: "#ede7f6", // Light Purple Text
                      lineHeight: "1.4",
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingBottom: 2,
                    }}
                  >
                    View your created admin users here
                  </Typography>
                  <Box
                    sx={{
                      marginTop: "auto",
                      paddingTop: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "#d1c4e9", // Soft Purple
                      }}
                    >
                      More info &rarr;
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
            {session.user.roleName === "Super Admin" && (
              <Grid item xs={12} md={4}>
                <Paper
                  component={Link}
                  href="/users"
                  elevation={3}
                  sx={{
                    backgroundColor: "#ff9800", // Orange
                    color: "#fff",
                    textDecoration: "none",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#f57c00", // Darker Orange on hover
                      transform: "translateY(-4px)",
                      transition: "0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    level={isXs ? "title-md" : "title-lg"}
                    sx={{
                      color: "#fff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingTop: 2,
                    }}
                  >
                    View Students
                  </Typography>
                  <Typography
                    level={isXs ? "body-xs" : "body-sm"}
                    sx={{
                      fontWeight: "400",
                      color: "#fff3e0", // Light Orange Text
                      lineHeight: "1.4",
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingBottom: 2,
                    }}
                  >
                    View your created students here
                  </Typography>
                  <Box
                    sx={{
                      marginTop: "auto",
                      paddingTop: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "#ffe0b2", // Soft Orange
                      }}
                    >
                      More info &rarr;
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Item Reports Over Time */}
        <Grid
          item
          xs={12}
          lg={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Typography level="h3" gutterBottom>
            Item Reports Over Time
          </Typography>
          <Card sx={{ flex: 1, borderTop: "3px solid #3f51b5" }}>
            <CardContent>
              {isClient && (
                <Chart
                  options={chartData.options}
                  series={chartData.series}
                  type="line"
                  height={335}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Students */}
        <Grid
          item
          xs={12}
          lg={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <TopStudentsEarnedBadges users={users} />
        </Grid>
      </Grid>
    </>
  );
};

export default AdminDashboard;
