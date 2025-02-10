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

const EditRole = ({
  open,
  onClose,
  role,
  refreshData,
  setOpenSnackbar,
  setMessage,
  update,
  session,
}) => {
  const [name, setName] = useState(role.name);
  const [color, setColor] = useState(role.color);
  const [selectedPermissions, setSelectedPermissions] = useState(
    role.permissions
  );
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

    try {
      // ✅ Ensure at least one dashboard permission is selected
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

      const roleData = {
        name: name.trim(),
        color,
        permissions: selectedPermissions, // ✅ Store only selected permissions
      };

      // ✅ Fetch all users to check roles
      const usersResponse = await fetch("/api/users");
      if (!usersResponse.ok) throw new Error("Failed to fetch users");

      const usersData = await usersResponse.json();

      // ✅ Find users who have "Manage Roles" permission
      const usersWithManageRoles = usersData.filter((user) =>
        user?.role?.permissions.includes("Manage Roles")
      );

      // ✅ Check if the logged-in user is the only one with "Manage Roles"
      const isOnlyUserWithManageRoles =
        usersWithManageRoles.length === 1 &&
        usersWithManageRoles[0]._id === session?.user?.id;

      // ✅ Check if the logged-in user is editing their own role
      const isEditingOwnRole = session?.user?.roleName === role.name;

      // 🚨 Prevent removal of "Manage Roles" if user is the only one with it
      if (
        isOnlyUserWithManageRoles &&
        isEditingOwnRole &&
        !roleData.permissions.includes("Manage Roles")
      ) {
        setOpenSnackbar("danger");
        setMessage(
          "You cannot remove 'Manage Roles' from your own role because you are the only user with this permission."
        );
        setLoading(false);
        return;
      }

      // 🚨 Prevent self-removal of "Manage Roles" even if others have it
      if (
        isEditingOwnRole &&
        session?.user?.permissions.includes("Manage Roles") &&
        !roleData.permissions.includes("Manage Roles")
      ) {
        setOpenSnackbar("danger");
        setMessage(
          "You cannot remove 'Manage Roles' from your own role even if other users have it."
        );
        setLoading(false);
        return;
      }

      // ✅ Ensure `role._id` is valid before making API call
      if (!role?._id) {
        setOpenSnackbar("danger");
        setMessage("Invalid role ID. Cannot update role.");
        setLoading(false);
        return;
      }

      // ✅ Proceed with updating the role
      const response = await fetch(`/api/role/${role._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Failed to update role: ${data.error}`);
      }

      // ✅ If update is successful
      onClose();
      await refreshData();

      // ✅ If the logged-in user's role is updated, update session permissions
      if (isEditingOwnRole) {
        await update({
          ...session,
          user: {
            ...session.user,
            roleName: roleData.name,
            permissions: selectedPermissions,
          },
        });
      }

      setOpenSnackbar("success");
      setMessage("Role updated successfully!");
    } catch (error) {
      console.error("Error in handleSubmit:", error); // ✅ Logs the actual error
      setOpenSnackbar("danger");
      setMessage(error.message || "An error occurred while updating the role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2 }}>
          Edit Role
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
              Update Role
            </Button>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default EditRole;
