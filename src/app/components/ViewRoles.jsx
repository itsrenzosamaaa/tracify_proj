'use client'

import React, { useState } from 'react';
import { Box, Typography, Table, Button, Snackbar, Modal, ModalDialog, ModalClose, DialogContent, Input, IconButton } from '@mui/joy';
import { Card, Grid, CardContent, TableHead, TableBody, TableRow, TableCell, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import SearchIcon from "@mui/icons-material/Search"
import AddRole from './Modal/AddRole';
import { MoreHoriz } from '@mui/icons-material';
import EditRole from './Modal/EditRole';

const ViewRoles = ({ roles, session, refreshData, admin }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentRoleId, setCurrentRoleId] = useState(null);
    const [open, setOpen] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(null);
    const [addRole, setAddRole] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMenuOpen = (event, roleId) => {
        setAnchorEl(event.currentTarget);
        setCurrentRoleId(roleId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setCurrentRoleId(null);
    };

    const formatPermissionName = (permissionKey) => {
        return permissionKey
            // Split on camelCase
            .replace(/([A-Z])/g, ' $1')
            // Handle consecutive uppercase letters (e.g., "API" in "viewAPIConfig")
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            // Capitalize first letter
            .replace(/^./, str => str.toUpperCase())
            // Remove extra spaces
            .trim();
    };

    const handleDelete = async (roleId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/roles/${roleId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                setOpenSnackbar('danger');
                setMessage(data.message);
            } else {
                setOpenSnackbar('success');
                setMessage('Role deleted successfully!');
                refreshData(); // Refresh roles data
            }

            setOpenDeleteModal(null);
        } catch (error) {
            setOpenSnackbar('danger');
            setMessage('Failed to delete role');
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <TitleBreadcrumbs title="Manage Roles" text="Roles" />
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Card sx={{ mt: 2, borderTop: '3px solid #3f51b5' }}>
                        <Box sx={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Input startDecorator={<SearchIcon />} />
                            <Button onClick={() => setAddRole(true)} startDecorator={<AddIcon />}>Add Role</Button>
                            {
                                session?.user?.roleName === 'Super Admin' && <AddRole open={addRole} onClose={() => setAddRole(false)} refreshData={refreshData} setMessage={setMessage} setOpenSnackbar={setOpenSnackbar} />
                            }
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
                                        <TableCell>Role</TableCell>
                                        <TableCell>School Category</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {roles ? (
                                        roles.map(role => (
                                            <TableRow key={role._id}>
                                                <TableCell>{role.name}</TableCell>
                                                <TableCell>{role.school_category}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={(event) => handleMenuOpen(event, role._id)}
                                                        aria-controls={currentRoleId === role._id ? `menu-${role._id}` : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={currentRoleId === role._id ? 'true' : undefined}
                                                    >
                                                        <MoreHoriz />
                                                    </IconButton>
                                                    <Menu
                                                        id={`menu-${role._id}`}
                                                        anchorEl={anchorEl}
                                                        open={currentRoleId === role._id}
                                                        onClose={handleMenuClose}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'right',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'right',
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
                                                        {
                                                            session?.user?.roleName === 'Super Admin' &&
                                                            <MenuItem
                                                                onClick={() => {
                                                                    setOpenEditModal(role._id);
                                                                    handleMenuClose();
                                                                }}
                                                            >
                                                                Edit
                                                            </MenuItem>
                                                        }
                                                        {
                                                            session?.user?.roleName === 'Super Admin' &&
                                                            <MenuItem
                                                                onClick={() => {
                                                                    setOpenDeleteModal(role._id);
                                                                    handleMenuClose();
                                                                }}
                                                            >
                                                                Delete
                                                            </MenuItem>
                                                        }
                                                    </Menu>
                                                    <Modal open={open === role._id} onClose={() => setOpen(null)}>
                                                        <ModalDialog>
                                                            <Typography level="h4">Role Details</Typography>
                                                            <ModalClose />
                                                            <DialogContent
                                                                sx={{
                                                                    overflowX: 'hidden',
                                                                    overflowY: 'auto', // Allows vertical scrolling
                                                                    '&::-webkit-scrollbar': { display: 'none' }, // Hides scrollbar in WebKit-based browsers (Chrome, Edge, Safari)
                                                                    '-ms-overflow-style': 'none', // Hides scrollbar in IE and Edge
                                                                    'scrollbar-width': 'none', // Hides scrollbar in Firefox
                                                                }}
                                                            >
                                                                <Typography level="body-md">
                                                                    <strong>Name: </strong> {role.name}
                                                                </Typography>
                                                                <Typography level="body-md">
                                                                    <strong>Office Location: </strong> {role.office_location}
                                                                </Typography>
                                                                <Typography level="body-md">
                                                                    <strong>School Category: </strong> {role.school_category}
                                                                </Typography>
                                                                <Typography level="body-md" fontWeight={700}>Permissions</Typography>
                                                                <ul>
                                                                    {Object.entries(role.permissions).map(([key, value]) => (
                                                                        value ? <li key={key}>{formatPermissionName(key)} </li> : null
                                                                    ))}
                                                                </ul>
                                                            </DialogContent>
                                                        </ModalDialog>
                                                    </Modal>
                                                    <EditRole open={openEditModal} onClose={() => setOpenEditModal(false)} refreshData={refreshData} role={role} setMessage={setMessage} setOpenSnackbar={setOpenSnackbar} />
                                                    <Modal open={openDeleteModal === role._id} onClose={() => setOpenDeleteModal(null)}>
                                                        <ModalDialog>
                                                            <ModalClose />
                                                            <Typography level="h4">Delete Role</Typography>
                                                            <Typography level="body-md" sx={{ mt: 1 }}>
                                                                Are you sure you want to delete this role? If this role is still assigned to admin users, it cannot be deleted.
                                                            </Typography>
                                                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                                <Button disabled={loading} variant="plain" onClick={() => setOpenDeleteModal(null)}>Cancel</Button>
                                                                <Button
                                                                    loading={loading}
                                                                    disabled={loading}
                                                                    color="danger"
                                                                    onClick={() => handleDelete(role._id)}
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
                                            <TableCell colSpan={3} align="center">Loading roles...</TableCell>
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
                    if (reason === 'clickaway') {
                        return;
                    }
                    setOpenSnackbar(null);
                }}
            >
                {message}
            </Snackbar>
        </>
    );
}

export default ViewRoles;
