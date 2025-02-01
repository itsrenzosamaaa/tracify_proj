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
import AddRole from "./Modal/AddLocation";
import { MoreHoriz } from "@mui/icons-material";
import EditLocation from "./Modal/EditLocation";

const ViewLocations = ({ locations, session, refreshData }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [open, setOpen] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(null);
  const [addLocation, setAddLocation] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
              <Input startDecorator={<SearchIcon />} />
              <Button
                onClick={() => setAddLocation(true)}
                startDecorator={<AddIcon />}
              >
                Add Location
              </Button>
              <AddRole
                open={addLocation}
                onClose={() => setAddLocation(false)}
                refreshData={refreshData}
                setMessage={setMessage}
                setOpenSnackbar={setOpenSnackbar}
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
                  {locations ? (
                    locations.map((location) => (
                      <TableRow key={location._id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>
                          <Button
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
                              <Typography level="h4">View Areas</Typography>
                              <ModalClose />
                              <DialogContent
                                sx={{
                                  overflowX: "hidden",
                                  overflowY: "auto", // Allows vertical scrolling
                                  "&::-webkit-scrollbar": { display: "none" }, // Hides scrollbar in WebKit-based browsers (Chrome, Edge, Safari)
                                  "-ms-overflow-style": "none", // Hides scrollbar in IE and Edge
                                  "scrollbar-width": "none", // Hides scrollbar in Firefox
                                }}
                              >
                                {location.areas.map((area, index) => {
                                  <Typography level="body-md" key={index}>
                                    {area}
                                  </Typography>;
                                })}
                              </DialogContent>
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
                          />
                          <Modal
                            open={openDeleteModal === location._id}
                            onClose={() => setOpenDeleteModal(null)}
                          >
                            <ModalDialog>
                              <ModalClose />
                              <Typography level="h4">Delete Location</Typography>
                              <Typography level="body-md" sx={{ mt: 1 }}>
                                Are you sure you want to delete this location?
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
