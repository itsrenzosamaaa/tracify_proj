'use client'

import React, { useState, useEffect } from "react";
import { Box, Breadcrumbs, Typography, Link } from "@mui/joy";
import { Paper, Grid } from "@mui/material";
import RequestsTable from "../components/Table/RequestsTable";
import { useSession } from "next-auth/react";

const Request = () => {
  const { data: session, status } = useSession();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items');
        const data = await response.json();
        const filteredStatus = data.filter(item => item.status === 'Request' && item.itemSchoolCategory === session.user.roleData.schoolCategory);
        setItems(filteredStatus);
      } catch (error) {
        console.error("Failed to fetch items: ", error);
      }
    };
    if (status === 'authenticated') {
      fetchItems();
    }
  }, [session, status]);

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
        <RequestsTable items={items} />
      </Box>
    </>
  );
};

export default Request;
