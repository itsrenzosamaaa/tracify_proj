'use client'

import React from "react";
import { Grid, Paper } from "@mui/material";
import { Box, Typography, Skeleton } from "@mui/joy";
import Updates from "../components/Updates/Updates";
import DonutChart from "../components/Charts/DonutChart";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session, status } = useSession();
  console.log("Session: ", session);
  console.log("Status: ", status);

  return (
    <Box
      sx={{
        marginTop: "60px", // Ensure space for header
        marginLeft: { xs: '0px', lg: '250px' }, // Shift content when sidebar is visible on large screens
        padding: "20px",
        transition: 'margin-left 0.3s ease',
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={7} lg={8}>
          <Paper elevation={2} sx={{ padding: "1rem", height: "auto", marginBottom: '1.2rem' }}>
            <Skeleton
              loading={status === 'loading'}
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            >
              <Typography level="h2" sx={{ display: 'inline-block', width: '100%' }}>
                {status === 'loading' ? "Loading..." : `Welcome, ${session.user?.firstname}!`}
              </Typography>
              <Typography sx={{ display: 'inline-block', width: '100%' }}>
                {status === 'loading' ? "Fetching details, please wait..." : "This is the current reported items as of now..."}
              </Typography>
            </Skeleton>
          </Paper>

          <Paper elevation={2} sx={{ padding: "1rem" }}>
            <DonutChart />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={5} lg={4}>
          <Updates />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
