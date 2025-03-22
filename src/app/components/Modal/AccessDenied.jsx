import { Typography } from "@mui/joy";
import React from "react";

const AccessDenied = () => {
  return (
    <>
      <Typography level="h4" sx={{ mb: 2 }}>
        Access Denied
      </Typography>
      <Typography level="body-md">
        You have no permission to use this function.
      </Typography>
    </>
  );
};

export default AccessDenied;
