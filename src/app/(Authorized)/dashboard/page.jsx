"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import AdminDashboard from "@/app/components/Dashboard/AdminDashboard";
import UserDashboard from "@/app/components/Dashboard/UserDashboard";
import Loading from "@/app/components/Loading";
import { Box, Card, CardContent, Typography } from "@mui/joy";
import { HelpOutline } from "@mui/icons-material";

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <>
      {session?.user?.permissions.includes("Admin Dashboard") && (
        <AdminDashboard users={users} session={session} />
      )}
      {session?.user?.permissions.includes("User Dashboard") && (
        <UserDashboard users={users} session={session} status={status} />
      )}
      {session?.user?.permissions.length === 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            backgroundColor: "background.default",
          }}
        >
          <Card
            variant="outlined"
            sx={{
              maxWidth: 500,
              p: 3,
              borderRadius: "md",
              boxShadow: 4,
              textAlign: "center",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <HelpOutline
                sx={{ fontSize: 50, color: "warning.main", mb: 2 }}
              />
              <Typography level="h3" sx={{ mb: 1, color: "text.primary" }}>
                Access Restricted
              </Typography>
              <Typography level="body1" sx={{ color: "text.secondary", mb: 3 }}>
                Your account currently does not have any assigned roles or
                permissions. Please approach to the administrator for access.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
};

export default DashboardPage;
