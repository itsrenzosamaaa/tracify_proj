import React from "react";
import { Box, Typography, Breadcrumbs, Link } from "@mui/joy";
import { Paper, Grid } from "@mui/material";
import UsersTable from "../components/Table/UsersTable";

const Users = () => {
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
        <Grid container spacing={2}>
          <Grid item xs={12} lg={7.5}>
            <Paper
              elevation={2}
              sx={{
                padding: "1rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: '4.47rem',
              }}
            >
              <Typography level="h3">Users</Typography>
              <Breadcrumbs aria-label="breadcrumbs">
                <Link color="neutral" href="/office/dashboard">
                  Home
                </Link>
                <Typography>Users</Typography>
              </Breadcrumbs>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4.5}>
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
              <Box>
                <Typography level="body-md" sx={{ fontWeight: "700" }}>
                  Office Name:
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: "700" }}>
                  Office Location:
                </Typography>
                <Typography level="body-md" sx={{ fontWeight: "700" }}>
                  School Category:
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography level="body-md">SASO</Typography>
                <Typography level="body-md">
                  3rd Floor of RLO Building
                </Typography>
                <Typography level="body-md">Higher Education</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <UsersTable />
      </Box>
    </>
  );
};

export default Users;
