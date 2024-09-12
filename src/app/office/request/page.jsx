import React from "react";
import { Box, Breadcrumbs, Typography, Link } from "@mui/joy";
import { Paper, Grid } from "@mui/material";
import RequestsTable from "../components/Table/RequestsTable";

const Request = () => {
  return (
    <>
      <Box
        sx={{
          marginTop: "60px", // Ensure space for header
          marginLeft: { xs: "0px", lg: "250px" }, // Shift content when sidebar is visible on large screens
          padding: "20px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Paper
          elevation={2}
          sx={{
            padding: "1rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Grid item xs={12} lg={6}>
            <h2>Requests</h2>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Breadcrumbs aria-label="breadcrumbs">
              <Link color="neutral" href="/office/dashboard">
                Home
              </Link>
              <Typography>Requests</Typography>
            </Breadcrumbs>
          </Grid>
        </Paper>
        <RequestsTable />
      </Box>
    </>
  );
};

export default Request;
