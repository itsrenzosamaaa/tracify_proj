import React from "react";
import { Box } from "@mui/joy";

const Dashboard = () => {
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
        Hello
      </Box>
    </>
  );
};

export default Dashboard;
