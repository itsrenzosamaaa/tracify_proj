"use client";

import ViewRoles from "@/app/components/ViewRoles";
import { Snackbar } from "@mui/joy";
import { useSession } from "next-auth/react";
import React, { useState, useCallback, useEffect } from "react";

const RolePage = () => {
  const [roles, setRoles] = useState([]);
  const { data: session, status, update } = useSession();
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch("api/role");
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  if (status === "loading") {
    return null;
  }

  return (
    <>
      <ViewRoles
        roles={roles}
        refreshData={fetchRoles}
        session={session}
        update={update}
        setOpenSnackbar={setOpenSnackbar}
        setMessage={setMessage}
      />
      <Snackbar
        autoHideDuration={5000}
        open={openSnackbar}
        variant="solid"
        color={openSnackbar}
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setOpenSnackbar(null);
        }}
      >
        {message}
      </Snackbar>
    </>
  );
};

export default RolePage;
