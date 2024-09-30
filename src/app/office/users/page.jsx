'use client'

import React, { useState, useEffect } from "react";
import { Box, Typography, Breadcrumbs, Link, Button } from "@mui/joy";
import { Paper, Grid } from "@mui/material";
import UsersTable from "../components/Table/UsersTable";
import { useSession } from "next-auth/react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const { data: session, status } = useSession();
  console.log("data: ", session)
  console.log("status: ", status)

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      console.log(data)
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        {status === 'loading' ? 'PAG TAGA HULAT MAN DAW' : (
          <>
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
                    <Typography level="body-md">{session.user.roleData.officeName}</Typography>
                    <Typography level="body-md">
                      {session.user.roleData.officeAddress}
                    </Typography>
                    <Typography level="body-md">{session.user.roleData.schoolCategory}</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            <Paper elevation={2}>
              <Box sx={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Button component={Link} href="/office/users/add_user">
                  Add User
                </Button>
              </Box>
              <UsersTable users={users} session={session} />
            </Paper>
          </>
        )}
      </Box>
    </>
  );
};

export default Users;