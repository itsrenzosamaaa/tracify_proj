"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Modal,
  ModalDialog,
  CircularProgress,
  Snackbar,
  Input,
  Table,
  IconButton,
  Chip,
  ModalClose,
  FormControl,
  FormLabel,
  Select,
  Option,
} from "@mui/joy";
import {
  Grid,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@mui/material";
import TitleBreadcrumbs from "./Title/TitleBreadcrumbs";
import Papa from "papaparse";
import { MoreHoriz } from "@mui/icons-material";
import { Search } from "@mui/icons-material";
import EditUser from "./Modal/EditUser";
import AccessDenied from "./Modal/AccessDenied";

const ViewUsers = ({ users, roles, refreshData, session }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(null);
  const [openEditRole, setOpenEditRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const fileInputRef = useRef(null);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenRoleModal = (user) => {
    setOpenEditRole(user._id);
    setSelectedRole(user.role?._id || ""); // Ensure the role is set properly
  };

  const handleAssignRole = async (userId) => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const result = await response.json();

      if (response.ok) {
        setOpenSnackbar("success");
        setMessage("Role assigned successfully!");
        refreshData();
      } else {
        setOpenSnackbar("danger");
        setMessage(`Failed to assign role: ${result.error}`);
      }
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("An error occurred while assigning the role.");
    } finally {
      setIsLoading(false);
      setOpenEditRole(null);
    }
  };

  const handleMenuOpen = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setCurrentUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentUserId(null);
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.role?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDelete = async (e, userId) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/users?account=${userId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok) {
        setOpenDeleteModal(null);
        refreshData();
        setOpenSnackbar("danger");
        setMessage(result.message);
      } else {
        setOpenSnackbar("danger");
        setMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      Papa.parse(file, {
        header: true, // Use headers from the first row of the CSV
        skipEmptyLines: true, // Skip blank lines
        complete: async (results) => {
          try {
            setLoading(true);
            const response = await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(results.data),
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.error || "Failed to import users");
            }

            refreshData(); // Refresh the list of users
            setOpenSnackbar("success");
            setMessage("User(s) imported successfully!");
          } catch (error) {
            setMessage(
              error.message || "An error occurred while importing users."
            );
            setOpenSnackbar("danger");
          } finally {
            setLoading(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }
        },
        error: (error) => {
          setMessage("Error parsing CSV file. Please try again.");
          setOpenSnackbar("error");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      });
    }
  };

  const hasPermission = session?.user?.permissions || [];

  return (
    <>
      <TitleBreadcrumbs title="Manage Users" text="Users" />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ mt: 2, borderTop: "3px solid #3f51b5" }}>
            <Box
              sx={{
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Input
                startDecorator={<Search />}
                size={isXs ? "sm" : "md"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: "50%", md: "200px" } }}
              />
              {hasPermission.includes("Add User") && (
                <Button component="label">
                  Import Data
                  <input
                    type="file"
                    accept=".csv"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </Button>
              )}
              <Modal open={loading} onClose={() => {}} disableEscapeKeyDown>
                <ModalDialog sx={{ alignItems: "center", padding: "1rem" }}>
                  <Typography level="body-lg" fontWeight={700} gutterBottom>
                    Importing users data...
                  </Typography>
                  <CircularProgress />
                </ModalDialog>
              </Modal>
            </Box>
            <CardContent>
              <TableContainer
                sx={{
                  overflowX: "auto", // Enables horizontal scrolling
                  borderRadius: 2,
                  "@media (max-width: 600px)": {
                    maxWidth: "100vw", // Ensure it doesn't exceed the screen width
                  },
                }}
              >
                <Table
                  stickyHeader
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    minWidth: 650,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: isXs ? "100px" : "200px" }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ width: isXs ? "200px" : "300px" }}>
                        Email Address
                      </TableCell>
                      <TableCell sx={{ width: isXs ? "100px" : "175px" }}>
                        Contact Number
                      </TableCell>
                      <TableCell sx={{ width: isXs ? "75px" : "150px" }}>
                        Role
                      </TableCell>
                      <TableCell sx={{ width: isXs ? "70px" : "90px" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((user, index) => (
                          <>
                            <TableRow key={index}>
                              <TableCell
                                sx={{ width: isXs ? "150px" : "250px" }}
                              >
                                {user.firstname} {user.lastname}
                              </TableCell>
                              <TableCell
                                sx={{
                                  width: isXs ? "300px" : "400px",
                                  whiteSpace: { xs: "nowrap" },
                                  overflow: { xs: "hidden" },
                                  textOverflow: { xs: "ellipsis" },
                                }}
                              >
                                {user.emailAddress}
                              </TableCell>
                              <TableCell
                                sx={{ width: isXs ? "300px" : "400px" }}
                              >
                                {user.contactNumber}
                              </TableCell>
                              <TableCell
                                sx={{ width: isXs ? "100px" : "200px" }}
                              >
                                <Chip
                                  onClick={() => {
                                    if (session?.user?.id !== user._id) {
                                      handleOpenRoleModal(user);
                                    }
                                  }}
                                  sx={{
                                    backgroundColor: user.role
                                      ? user.role.color
                                      : "" + "20",
                                    color: user.role ? user.role.color : "",
                                    cursor: "pointer",
                                    "&:hover": {
                                      backgroundColor: user.role
                                        ? user.role.color
                                        : "" + "30",
                                    },
                                    border: `1px solid ${
                                      user.role ? user.role.color : ""
                                    }`,
                                  }}
                                >
                                  {user.role
                                    ? user.role.name
                                    : "Not yet assigned"}
                                </Chip>
                              </TableCell>
                              <TableCell sx={{ width: isXs ? "70px" : "90px" }}>
                                <IconButton
                                  onClick={(event) =>
                                    handleMenuOpen(event, user._id)
                                  }
                                  aria-controls={
                                    currentUserId === user._id
                                      ? `menu-${user._id}`
                                      : undefined
                                  }
                                  aria-haspopup="true"
                                  aria-expanded={
                                    currentUserId === user._id
                                      ? "true"
                                      : undefined
                                  }
                                >
                                  <MoreHoriz />
                                </IconButton>
                                <Menu
                                  id={`menu-${user._id}`}
                                  anchorEl={anchorEl}
                                  open={currentUserId === user._id}
                                  onClose={handleMenuClose}
                                  anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                  }}
                                  transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                  }}
                                >
                                  <MenuItem
                                    onClick={() => {
                                      setOpenEditModal(user._id);
                                      handleMenuClose();
                                    }}
                                  >
                                    Edit
                                  </MenuItem>
                                  {session?.user?.id !== user._id && (
                                    <MenuItem
                                      onClick={() => {
                                        setOpenDeleteModal(user._id);
                                        handleMenuClose();
                                      }}
                                    >
                                      Delete
                                    </MenuItem>
                                  )}
                                </Menu>
                              </TableCell>
                            </TableRow>
                            <Modal
                              open={openEditRole === user._id}
                              onClose={() => setOpenEditRole(null)}
                            >
                              <ModalDialog>
                                <ModalClose />
                                {hasPermission.includes("Assign Role") ? (
                                  <>
                                    <Typography level="h4" sx={{ mb: 2 }}>
                                      Assign Role
                                    </Typography>
                                    <FormControl sx={{ mb: 3 }}>
                                      <FormLabel>Select Role</FormLabel>
                                      <Select
                                        value={selectedRole}
                                        onChange={(e, newValue) =>
                                          setSelectedRole(newValue)
                                        }
                                        placeholder="Select role"
                                      >
                                        {roles.map((role) => (
                                          <Option
                                            key={role._id}
                                            value={role._id}
                                          >
                                            {role.name}
                                          </Option>
                                        ))}
                                      </Select>
                                    </FormControl>
                                    <Button
                                      fullWidth
                                      onClick={() =>
                                        handleAssignRole(openEditRole)
                                      }
                                      loading={isLoading}
                                      disabled={
                                        isLoading ||
                                        selectedRole ===
                                          users.find(
                                            (user) => user._id === openEditRole
                                          )?.role?._id
                                      }
                                    >
                                      Assign Role
                                    </Button>
                                  </>
                                ) : (
                                  <AccessDenied />
                                )}
                              </ModalDialog>
                            </Modal>
                            <Modal
                              open={openDeleteModal === user._id}
                              onClose={() => setOpenDeleteModal(null)}
                            >
                              <ModalDialog>
                                <ModalClose
                                  aria-label="Close"
                                  sx={{ top: "16px", right: "16px" }}
                                />
                                {hasPermission.includes("Delete User") ? (
                                  <>
                                    <Typography
                                      level="h3"
                                      fontWeight="700"
                                      sx={{ mb: 2 }}
                                    >
                                      Delete User
                                    </Typography>
                                    <Typography align="center" sx={{ mb: 3 }}>
                                      Are you sure you want to delete this user?
                                      This action cannot be undone.
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: 2,
                                      }}
                                    >
                                      <Button
                                        disabled={isLoading}
                                        loading={isLoading}
                                        fullWidth
                                        onClick={(e) =>
                                          handleDelete(e, user._id)
                                        }
                                        color="danger"
                                        aria-label="Confirm delete"
                                      >
                                        Confirm
                                      </Button>
                                      <Button
                                        disabled={isLoading}
                                        fullWidth
                                        onClick={() => setOpen(null)}
                                        variant="outlined"
                                        aria-label="Cancel delete"
                                      >
                                        Cancel
                                      </Button>
                                    </Box>
                                  </>
                                ) : (
                                  <AccessDenied />
                                )}
                              </ModalDialog>
                            </Modal>
                          </>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No users found...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {openEditModal && (
                <EditUser
                  user={filteredUsers.find(
                    (user) => user._id === openEditModal
                  )}
                  open={openEditModal}
                  onClose={() => setOpenEditModal(null)}
                  setOpenSnackbar={setOpenSnackbar}
                  setMessage={setMessage}
                  refreshData={refreshData}
                  checkPermission={hasPermission.includes("Edit User")}
                />
              )}
              <TablePagination
                rowsPerPageOptions={4}
                component="div"
                count={filteredUsers.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        autoHideDuration={5000}
        open={openSnackbar}
        variant="solid"
        color={openSnackbar}
        onClose={() => setOpenSnackbar(null)}
      >
        {message}
      </Snackbar>
    </>
  );
};

export default ViewUsers;
