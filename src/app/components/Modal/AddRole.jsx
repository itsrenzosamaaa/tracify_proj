"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  FormLabel,
  FormControl,
  ModalDialog,
  ModalClose,
  DialogContent,
  Modal,
  Checkbox,
  Grid,
} from "@mui/joy";

const dashboardOptions = ["Admin Dashboard", "User Dashboard"];

const permissionOptions = [
  "View Profile",
  "View My Items",
  "View Rankings",
  "View Notifications",
  "Request Items",
  "Manage Users",
  "Manage Items",
  "Manage Item Retrievals",
  "Manage Roles",
  "Manage Locations",
];

const AddRole = ({
  open,
  onClose,
  refreshData,
  setOpenSnackbar,
  setMessage,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Toggle Permission Selection

  const handleToggleDashboard = (selectedDashboard) => {
    setSelectedPermissions([selectedDashboard]); // ✅ Store only one value in the array
  };
  const handleTogglePermission = (permission) => {
    setSelectedPermissions(
      (prevPermissions) =>
        prevPermissions.includes(permission)
          ? prevPermissions.filter((p) => p !== permission) // Remove if exists
          : [...prevPermissions, permission] // Add if not exists
    );
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const roleData = {
      name: name.trim(),
      color,
      permissions: selectedPermissions, // ✅ Store only selected permissions
    };

    const hasDashboardPermission = selectedPermissions.some(
      (permission) =>
        permission === "Admin Dashboard" || permission === "User Dashboard"
    );
    if (!hasDashboardPermission) {
      setOpenSnackbar("danger");
      setMessage("Please choose at least one dashboard.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        onClose();
        await refreshData();
        setOpenSnackbar("success");
        setMessage("Role added successfully!");
        setName("");
        setColor("#000000");
        setSelectedPermissions([]);
      } else {
        const data = await response.json();
        setOpenSnackbar("danger");
        setMessage(`Failed to add role: ${data.error}`);
      }
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("An error occurred while adding the role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2 }}>
          Add Role
        </Typography>
        <DialogContent
          sx={{
            paddingRight: "calc(0 + 8px)", // Add extra padding to account for scrollbar width
            maxHeight: "85.5vh",
            height: "100%",
            overflowX: "hidden",
            overflowY: "scroll", // Always reserve space for scrollbar
            // Default scrollbar styles (invisible)
            "&::-webkit-scrollbar": {
              width: "8px", // Always reserve 8px width
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "transparent", // Invisible by default
              borderRadius: "4px",
            },
            // Show scrollbar on hover
            "&:hover": {
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0, 0, 0, 0.4)", // Only change the thumb color on hover
              },
            },
            // Firefox
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent", // Both track and thumb transparent
            "&:hover": {
              scrollbarColor: "rgba(0, 0, 0, 0.4) transparent", // Show thumb on hover
            },
            // IE and Edge
            msOverflowStyle: "-ms-autohiding-scrollbar",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl required fullWidth sx={{ mb: 2 }}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="e.g. Admin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>
              </Grid>

              {/* ✅ Role Color Picker */}
              <Grid item xs={12} md={6}>
                <FormControl required fullWidth sx={{ mb: 2 }}>
                  <FormLabel>Color</FormLabel>
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </FormControl>
              </Grid>

              {/* ✅ Permissions Section (Checkboxes) */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel>Dashboard</FormLabel>
                  {dashboardOptions.map((dashboard, index) => (
                    <Checkbox
                      sx={{ mb: 2 }}
                      key={index}
                      label={dashboard}
                      checked={selectedPermissions.includes(dashboard)}
                      onChange={() => handleToggleDashboard(dashboard)}
                    />
                  ))}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel>Permissions</FormLabel>
                  {permissionOptions.map((permission, index) => (
                    <Checkbox
                      sx={{ mb: 2 }}
                      key={index}
                      label={permission}
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => handleTogglePermission(permission)}
                    />
                  ))}
                </FormControl>
              </Grid>
            </Grid>
            <Button
              fullWidth
              sx={{ mt: 2 }}
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Add Role
            </Button>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default AddRole;
