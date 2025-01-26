"use client";

import React, { useState } from "react";
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

const ViewUsers = ({ users, refreshData, session }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEmailAddress, setIsEmailAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(null);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setCurrentUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentUserId(null);
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
            setMessage("Users imported successfully!");
          } catch (error) {
            setMessage(
              error.message || "An error occurred while importing users."
            );
            setOpenSnackbar("danger");
          } finally {
            setLoading(false);
          }
        },
        error: (error) => {
          setMessage("Error parsing CSV file. Please try again.");
          setOpenSnackbar("error");
        },
      });
    }
  };

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
              <Input startDecorator={<Search />} />
              {session?.user?.roleName === "SASO" && (
                <Button component="label">
                  Import Data
                  <input
                    type="file"
                    accept=".csv"
                    hidden
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
                      <TableCell sx={{ width: isXs ? "150px" : "250px" }}>
                        Name
                      </TableCell>
                      <TableCell
                        sx={{ width: isXs ? "300px" : "400px" }}
                        onClick={() => setIsEmailAddress(!isEmailAddress)}
                      >
                        {isEmailAddress ? "Email Address" : "Contact Number"}
                      </TableCell>
                      <TableCell sx={{ width: isXs ? "100px" : "200px" }}>
                        Role
                      </TableCell>
                      {session?.user?.roleName === "SASO" && (
                        <TableCell sx={{ width: isXs ? "70px" : "90px" }}>
                          Action
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length > 0 ? (
                      users
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
                                sx={{ width: isXs ? "300px" : "400px" }}
                                onClick={() =>
                                  setIsEmailAddress(!isEmailAddress)
                                }
                              >
                                {isEmailAddress
                                  ? user.emailAddress
                                  : user.contactNumber}
                              </TableCell>
                              <TableCell
                                sx={{ width: isXs ? "100px" : "200px" }}
                              >
                                <Chip
                                  color={
                                    user.role === "Student"
                                      ? "success"
                                      : user.role === "Parent"
                                      ? "primary"
                                      : user.role === "Faculty"
                                      ? "warning"
                                      : "neutral"
                                  }
                                  variant="solid"
                                >
                                  {user.role}
                                </Chip>
                              </TableCell>
                              {session?.user?.roleName === "SASO" && (
                                <TableCell
                                  sx={{ width: isXs ? "70px" : "90px" }}
                                >
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
                                    <MenuItem
                                      onClick={() => {
                                        handleMenuClose();
                                      }}
                                    >
                                      Delete
                                    </MenuItem>
                                  </Menu>
                                </TableCell>
                              )}
                            </TableRow>
                          </>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No users found...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {openEditModal && (
                <EditUser
                  user={users.find((user) => user._id === openEditModal)}
                  open={openEditModal}
                  onClose={() => setOpenEditModal(null)}
                  setOpenSnackbar={setOpenSnackbar}
                  setMessage={setMessage}
                  refreshData={refreshData}
                />
              )}
              <TablePagination
                rowsPerPageOptions={4}
                component="div"
                count={users.length}
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
