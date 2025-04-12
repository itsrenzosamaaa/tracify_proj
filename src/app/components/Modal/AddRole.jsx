"use client";

import React, { useState } from "react";
import {
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
  Box,
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

const AddRole = ({
  open,
  onClose,
  refreshData,
  setOpenSnackbar,
  setMessage,
  checkPermission,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isStudentRole, setIsStudentRole] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleDashboard = (dashboard) => {
    setSelectedPermissions((prev) => [
      ...prev.filter((p) => !dashboardOptions.includes(p)),
      dashboard,
    ]);
  };

  const handleTogglePermission = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const hasDashboardPermission = selectedPermissions.some((perm) =>
      dashboardOptions.includes(perm)
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
      permissions: selectedPermissions,
      isStudentRole,
    };

    try {
      const response = await fetch("/api/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        await refreshData();
        setOpenSnackbar("success");
        setMessage("Role added successfully!");
        onClose();
        setName("");
        setColor("#000000");
        setSelectedPermissions([]);
      } else {
        const data = await response.json();
        setOpenSnackbar("danger");
        setMessage(data.message);
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
        {checkPermission ? (
          <>
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
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  Add Role
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

export default AddRole;
