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
import AccessDenied from "./AccessDenied";

const dashboardOptions = ["Admin Dashboard", "User Dashboard"];

const basicPermissionOptions = [
  "View Profile",
  "View My Items",
  "View Rankings",
  "Request Items",
  "Browse Lost Corner",
  "Browse Found Corner",
];

const managementSections = [
  "Location Management",
  "Role Management",
  "User Management",
];
const crudActions = ["View", "Add", "Edit", "Delete"];

const itemManagement = ["Manage Items", "Manage Item Retrievals"];

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
  const [isStudentRole, setIsStudentRole] = useState(role.isStudentRole);
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
        isStudentRole,
      };

      // ✅ Fetch all users to check roles
      const usersResponse = await fetch("/api/users");
      if (!usersResponse.ok) throw new Error("Failed to fetch users");

      const usersData = await usersResponse.json();

      // ✅ Find users who have "View Role" and "Edit Role" permissions
      const usersWithRolePermissions = usersData.filter((user) =>
        user?.role?.permissions.some((perm) =>
          ["View Role", "Edit Role"].includes(perm)
        )
      );

      // ✅ Check if the logged-in user is the only one with "View Role" or "Edit Role"
      const isOnlyUserWithRolePermissions =
        usersWithRolePermissions.length === 1 &&
        usersWithRolePermissions[0]._id === session?.user?.id;

      // ✅ Check if the logged-in user is editing their own role
      const isEditingOwnRole = session?.user?.roleName === role.name;

      // 🚨 Prevent removal of "View Role" and "Edit Role" if user is the only one with it
      if (
        isOnlyUserWithRolePermissions &&
        isEditingOwnRole &&
        !["View Role", "Edit Role"].every((perm) =>
          roleData.permissions.includes(perm)
        )
      ) {
        setOpenSnackbar("danger");
        setMessage(
          "You cannot remove 'View Role' or 'Edit Role' from your own role because you are the only user with these permissions."
        );
        setLoading(false);
        return;
      }

      // 🚨 Prevent self-removal of "View Role" or "Edit Role" even if others have it
      if (
        isEditingOwnRole &&
        ["View Role", "Edit Role"].some((perm) =>
          session?.user?.permissions.includes(perm)
        ) &&
        !["View Role", "Edit Role"].every((perm) =>
          roleData.permissions.includes(perm)
        )
      ) {
        setOpenSnackbar("danger");
        setMessage(
          "You cannot remove 'View Role' or 'Edit Role' from your own role even if other users have these permissions."
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
        throw new Error(data.message);
      }

      // ✅ If update is successful
      onClose();
      await refreshData();

      setOpenSnackbar("success");
      setMessage("Role updated successfully!");

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
    } catch (error) {
      console.error("Error in updating role:", error); // ✅ Logs the actual error
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
        {session?.user?.permissions.includes("Edit Role") ? (
          <>
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

                  <Grid item xs={12}>
                    <FormControl required fullWidth sx={{ mb: 2 }}>
                      <Checkbox
                        label="Flag as a student role"
                        checked={isStudentRole}
                        onChange={(e) => setIsStudentRole(e.target.checked)}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography level="body-sm" fontWeight={700}>
                      Dashboard
                    </Typography>
                    {dashboardOptions.map((dashboard) => (
                      <FormControl fullWidth key={dashboard}>
                        <Checkbox
                          sx={{ mb: 1 }}
                          label={dashboard}
                          checked={selectedPermissions.includes(dashboard)}
                          onChange={() => handleToggleDashboard(dashboard)}
                        />
                      </FormControl>
                    ))}

                    {managementSections.map((section) => (
                      <Box key={section} sx={{ my: 1 }}>
                        <Typography level="body-sm" fontWeight={700}>
                          {section}
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          {crudActions.map((action) => {
                            const permLabel = `${action} ${section.replace(
                              " Management",
                              ""
                            )}`;
                            return (
                              <FormControl fullWidth key={permLabel}>
                                <Checkbox
                                  label={permLabel}
                                  sx={{ mb: 1 }}
                                  checked={selectedPermissions.includes(
                                    permLabel
                                  )}
                                  onChange={() =>
                                    handleTogglePermission(permLabel)
                                  }
                                />
                              </FormControl>
                            );
                          })}
                          {section === "Role Management" && (
                            <FormControl fullWidth>
                              <Checkbox
                                label="View Permissions"
                                sx={{ mb: 1 }}
                                checked={selectedPermissions.includes(
                                  "View Permissions"
                                )}
                                onChange={() =>
                                  handleTogglePermission("View Permissions")
                                }
                              />
                            </FormControl>
                          )}
                          {section === "Location Management" && (
                            <FormControl fullWidth>
                              <Checkbox
                                label="View Areas"
                                sx={{ mb: 1 }}
                                checked={selectedPermissions.includes(
                                  "View Areas"
                                )}
                                onChange={() =>
                                  handleTogglePermission("View Areas")
                                }
                              />
                            </FormControl>
                          )}
                          {section === "User Management" && (
                            <FormControl fullWidth>
                              <Checkbox
                                label="Assign Role"
                                sx={{ mb: 1 }}
                                checked={selectedPermissions.includes(
                                  "Assign Role"
                                )}
                                onChange={() =>
                                  handleTogglePermission("Assign Role")
                                }
                              />
                            </FormControl>
                          )}
                        </Box>
                      </Box>
                    ))}

                    <Box sx={{ my: 1 }}>
                      <Typography level="body-sm" fontWeight={700}>
                        Item Management
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        {itemManagement.map((item) => {
                          return (
                            <FormControl fullWidth key={item}>
                              <Checkbox
                                label={item}
                                sx={{ mb: 1 }}
                                checked={selectedPermissions.includes(item)}
                                onChange={() => handleTogglePermission(item)}
                              />
                            </FormControl>
                          );
                        })}
                      </Box>
                    </Box>
                    <Typography level="body-sm" fontWeight={700}>
                      General Permissions
                    </Typography>
                    {basicPermissionOptions.map((perm) => (
                      <FormControl fullWidth key={perm}>
                        <Checkbox
                          sx={{ mb: 1 }}
                          label={perm}
                          checked={selectedPermissions.includes(perm)}
                          onChange={() => handleTogglePermission(perm)}
                        />
                      </FormControl>
                    ))}
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
          </>
        ) : (
          <AccessDenied />
        )}
      </ModalDialog>
    </Modal>
  );
};

export default EditRole;
