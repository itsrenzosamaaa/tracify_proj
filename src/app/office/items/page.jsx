'use client'

import React, { useEffect, useState } from "react";
import TableComponent from "../components/Table/ItemsTable";
import { Box, Breadcrumbs, Typography } from "@mui/joy";
import { Paper, Grid } from "@mui/material";
import Link from "@mui/joy/Link";

const Items = () => {
  const [items, setItems] = useState([]);

  // useEffect(() => {
  //   const fetchItems = async () => {
  //     try {
  //       const response = await fetch('/api/found-items');
  //       const data = await response.json();
  //       setItems(data);
  //     } catch (error) {
  //       console.error("Failed to fetch items: ", error);
  //     }
  //   };

  //   fetchItems()
  // }, []);

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
            <h2>Items</h2>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Breadcrumbs aria-label="breadcrumbs">
              <Link color="neutral" href="/office/dashboard">
                Home
              </Link>
              <Typography>Items</Typography>
            </Breadcrumbs>
          </Grid>
        </Paper>
        <TableComponent items={items} />
      </Box>
    </>
  );
};

export default Items;
