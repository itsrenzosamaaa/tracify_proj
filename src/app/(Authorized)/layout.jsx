import React from "react";
import SidebarComponent from "../components/SidebarComponent";
import { Box } from "@mui/joy";

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <title>Dashboard</title>
      </head>
      <body style={{ backgroundColor: "whitesmoke", }}>
        <SidebarComponent />
        <Box
          sx={{
            marginTop: '60px',
            marginLeft: { xs: '0px', lg: '250px' },
            padding: { xs: '5px', md: '20px' },
            transition: 'margin-left 0.3s ease',
          }}
        >
          {children}
        </Box>
      </body>
    </html>
  );
}
