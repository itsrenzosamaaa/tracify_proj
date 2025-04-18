"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  Button,
  Snackbar,
  Modal,
  ModalDialog,
  ModalClose,
  DialogContent,
  Input,
  IconButton,
} from "@mui/joy";
import {
  Card,
  Grid,
  CardContent,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TitleBreadcrumbs from "./Title/TitleBreadcrumbs";
import SearchIcon from "@mui/icons-material/Search";
import { MoreHoriz } from "@mui/icons-material";
import EditLocation from "./Modal/EditLocation";
import AddLocation from "./Modal/AddLocation";
import AccessDenied from "./Modal/AccessDenied";

const ViewLocations = ({ locations, refreshData, session }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [open, setOpen] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(null);
  const [addLocation, setAddLocation] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMenuOpen = (event, roleId) => {
    setAnchorEl(event.currentTarget);
    setCurrentRoleId(roleId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentRoleId(null);
  };

  const handleDelete = async (locationId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/location/${locationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setOpenSnackbar("danger");
        setMessage(data.message);
      } else {
        setOpenSnackbar("success");
        setMessage("Location deleted successfully!");
        refreshData(); // Refresh roles data
      }

      setOpenDeleteModal(null);
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("Failed to delete location");
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations
    ? locations.filter((location) =>
        location?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const hasPermission = session?.user?.permissions || [];

  return (
    <>
      <TitleBreadcrumbs title="Manage Locations" text="Location" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ mt: 2, borderTop: "3px solid #3f51b5" }}>
            <Box
              sx={{
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Input
                sx={{ width: { sx: "45%", md: "200px" } }}
                startDecorator={<SearchIcon />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                size="small"
                onClick={() => setAddLocation(true)}
                startDecorator={<AddIcon />}
              >
                Add Location
              </Button>
              <AddLocation
                open={addLocation}
                onClose={() => setAddLocation(false)}
                refreshData={refreshData}
                setMessage={setMessage}
                setOpenSnackbar={setOpenSnackbar}
                checkPermission={hasPermission.includes("Add Location")}
              />
            </Box>
            <CardContent>
              <Table
                stickyHeader
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  maxWidth: "100%",
                  width: "100%",
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Location</TableCell>
                    <TableCell>Areas</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLocations ? (
                    filteredLocations.map((location) => (
                      <TableRow key={location._id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => {
                              setOpen(location._id);
                            }}
                          >
                            View Areas
                          </Button>
                          <Modal
                            open={open === location._id}
                            onClose={() => setOpen(null)}
                          >
                            <ModalDialog>
                              <ModalClose />
                              {hasPermission.includes("View Areas") ? (
                                <>
                                  <Typography level="h4">View Areas</Typography>
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
                                        scrollbarColor:
                                          "rgba(0, 0, 0, 0.4) transparent", // Show thumb on hover
                                      },
                                      // IE and Edge
                                      msOverflowStyle:
                                        "-ms-autohiding-scrollbar",
                                    }}
                                  >
                                    {location.areas.map((area, index) => {
                                      return (
                                        <Typography level="body-md" key={index}>
                                          {area}
                                        </Typography>
                                      );
                                    })}
                                  </DialogContent>
                                </>
                              ) : (
                                <AccessDenied />
                              )}
                            </ModalDialog>
                          </Modal>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={(event) =>
                              handleMenuOpen(event, location._id)
                            }
                            aria-controls={
                              currentRoleId === location._id
                                ? `menu-${location._id}`
                                : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={
                              currentRoleId === location._id
                                ? "true"
                                : undefined
                            }
                          >
                            <MoreHoriz />
                          </IconButton>
                          <Menu
                            id={`menu-${location._id}`}
                            anchorEl={anchorEl}
                            open={currentRoleId === location._id}
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
                                setOpenEditModal(location._id);
                                handleMenuClose();
                              }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setOpenDeleteModal(location._id);
                                handleMenuClose();
                              }}
                            >
                              Delete
                            </MenuItem>
                          </Menu>
                          <EditLocation
                            open={openEditModal}
                            onClose={() => setOpenEditModal(false)}
                            refreshData={refreshData}
                            location={location}
                            setMessage={setMessage}
                            setOpenSnackbar={setOpenSnackbar}
                            checkPermission={hasPermission.includes(
                              "Edit Location"
                            )}
                          />
                          <Modal
                            open={openDeleteModal === location._id}
                            onClose={() => setOpenDeleteModal(null)}
                          >
                            <ModalDialog>
                              <ModalClose />
                              {hasPermission.includes("Delete Location") ? (
                                <>
                                  <Typography level="h4">
                                    Delete Location
                                  </Typography>
                                  <Typography level="body-md" sx={{ mt: 1 }}>
                                    Are you sure you want to delete this
                                    location?
                                  </Typography>
                                  <Box
                                    sx={{
                                      mt: 2,
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      gap: 1,
                                    }}
                                  >
                                    <Button
                                      disabled={loading}
                                      variant="outlined"
                                      onClick={() => setOpenDeleteModal(null)}
                                      fullWidth
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      loading={loading}
                                      disabled={loading}
                                      color="danger"
                                      onClick={() => handleDelete(location._id)}
                                      fullWidth
                                    >
                                      Delete
                                    </Button>
                                  </Box>
                                </>
                              ) : (
                                <AccessDenied />
                              )}
                            </ModalDialog>
                          </Modal>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Loading locations...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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

export default ViewLocations;
