import React from "react";
import { Grid } from "@mui/material";
import { Box } from "@mui/joy";
import Updates from "../components/Updates/Updates";
import DonutChart from "../components/Charts/DonutChart";

const Dashboard = () => {
  return (
    <>
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
            <DonutChart />
          </Grid>
          <Grid item xs={12} sm={12} md={5} lg={4}>
            <Updates />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Dashboard;
