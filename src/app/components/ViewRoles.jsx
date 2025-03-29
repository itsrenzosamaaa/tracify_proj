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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TitleBreadcrumbs from "./Title/TitleBreadcrumbs";
import SearchIcon from "@mui/icons-material/Search";
import AddRole from "./Modal/AddRole";
import { MoreHoriz } from "@mui/icons-material";
import EditLocation from "./Modal/EditLocation";
import EditRole from "./Modal/EditRole";
import AccessDenied from "./Modal/AccessDenied";

const ViewRoles = ({ roles, refreshData, session, update }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [open, setOpen] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(null);
  const [addRole, setAddRole] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMenuOpen = (event, roleId) => {
    setAnchorEl(event.currentTarget);
    setCurrentRoleId(roleId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentRoleId(null);
  };

  const handleDelete = async (roleId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/role/${roleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setOpenSnackbar("danger");
        setMessage(data.message);
      } else {
        setOpenSnackbar("success");
        setMessage("Role deleted successfully!");
        refreshData(); // Refresh roles data
      }

      setOpenDeleteModal(null);
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("Failed to delete role");
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter((role) => {
    return role.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const hasPermission = session?.user?.permissions || [];

  return (
    <>
      <TitleBreadcrumbs title="Manage Roles" text="Role" />
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
                size={isXs ? "sm" : "md"}
                startDecorator={<SearchIcon />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: "50%", md: "200px" } }}
              />
              <Button
                onClick={() => setAddRole(true)}
                startDecorator={<AddIcon />}
                size="small"
              >
                Add Role
              </Button>
              <AddRole
                open={addRole}
                onClose={() => setAddRole(false)}
                refreshData={refreshData}
                setMessage={setMessage}
                setOpenSnackbar={setOpenSnackbar}
                checkPermission={hasPermission.includes("Add Role")}
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
                    <TableCell>Role Name</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role) => (
                      <TableRow key={role._id}>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor: role.color,
                              borderRadius: "50%",
                              border: "1px solid black",
                              width: "2rem",
                              height: "2rem",
                            }}
                          ></Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={(event) => handleMenuOpen(event, role._id)}
                            aria-controls={
                              currentRoleId === role._id
                                ? `menu-${role._id}`
                                : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={
                              currentRoleId === role._id ? "true" : undefined
                            }
                          >
                            <MoreHoriz />
                          </IconButton>
                          <Menu
                            id={`menu-${role._id}`}
                            anchorEl={anchorEl}
                            open={currentRoleId === role._id}
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
                                setOpen(role._id);
                                handleMenuClose();
                              }}
                            >
                              View Permissions
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setOpenEditModal(role._id);
                                handleMenuClose();
                              }}
                            >
                              Edit
                            </MenuItem>
                            {session?.user?.roleName !== role.name && (
                              <MenuItem
                                onClick={() => {
                                  setOpenDeleteModal(role._id);
                                  handleMenuClose();
                                }}
                              >
                                Delete
                              </MenuItem>
                            )}
                          </Menu>
                          <EditRole
                            open={openEditModal === role._id}
                            onClose={() => setOpenEditModal(false)}
                            refreshData={refreshData}
                            role={role}
                            setMessage={setMessage}
                            setOpenSnackbar={setOpenSnackbar}
                            update={update}
                            session={session}
                          />
                          <Modal
                            open={open === role._id}
                            onClose={() => setOpen(null)}
                          >
                            <ModalDialog>
                              <ModalClose />
                              {hasPermission.includes("View Permissions") ? (
                                <>
                                  <Typography level="h4">
                                    Permissions
                                  </Typography>
                                  <DialogContent
                                    sx={{
                                      overflowX: "hidden",
                                      overflowY: "auto", // Allows vertical scrolling
                                      "&::-webkit-scrollbar": {
                                        display: "none",
                                      }, // Hides scrollbar in WebKit-based browsers (Chrome, Edge, Safari)
                                      "-ms-overflow-style": "none", // Hides scrollbar in IE and Edge
                                      "scrollbar-width": "none", // Hides scrollbar in Firefox
                                    }}
                                  >
                                    {role.permissions.map(
                                      (permission, index) => {
                                        return (
                                          <Typography
                                            level="body-md"
                                            key={index}
                                          >
                                            {permission}
                                          </Typography>
                                        );
                                      }
                                    )}
                                  </DialogContent>
                                </>
                              ) : (
                                <AccessDenied />
                              )}
                            </ModalDialog>
                          </Modal>
                          <Modal
                            open={openDeleteModal === role._id}
                            onClose={() => setOpenDeleteModal(null)}
                          >
                            <ModalDialog>
                              <ModalClose />
                              {hasPermission.includes("Delete Role") ? (
                                <>
                                  <Typography level="h4">
                                    Delete Role
                                  </Typography>
                                  <Typography level="body-md" sx={{ mt: 1 }}>
                                    Are you sure you want to delete this role?
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
                                      onClick={() => handleDelete(role._id)}
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
                        Loading roles...
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

export default ViewRoles;
