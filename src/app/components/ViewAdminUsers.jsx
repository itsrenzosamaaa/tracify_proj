'use client'

import React, { useState } from 'react';
import { Chip, Box, Typography, FormLabel, Input, FormControl, Table, Button, Card, CardContent, Stack, Select, Option, Modal, ModalDialog, ModalClose, Snackbar, CircularProgress } from '@mui/joy';
import { Grid, TableHead, TableBody, TableRow, TableCell, TablePagination, TableContainer, useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import Papa from 'papaparse';
import { Search } from '@mui/icons-material';

const ViewAdminUsers = ({ users, roles, refreshData, session }) => {
    const [open, setOpen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(null);
    const [message, setMessage] = useState('');
    const [roleModal, setRoleModal] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            Papa.parse(file, {
                header: true, // Use headers from the first row of the CSV
                skipEmptyLines: true, // Skip blank lines
                complete: async (results) => {
                    try {
                        setLoading(true);
                        const response = await fetch('/api/admin', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(results.data),
                        });

                        const result = await response.json();

                        if (!response.ok) {
                            throw new Error(result.error || 'Failed to import admins');
                        }

                        refreshData(); // Refresh the list of users
                        setMessage("Admins imported successfully!");
                        setOpenSnackbar('success');
                    } catch (error) {
                        setMessage(error.message || 'An error occurred while importing admins.');
                        setOpenSnackbar('error');
                    } finally {
                        setLoading(false);
                    }
                },
                error: (error) => {
                    setMessage('Error parsing CSV file. Please try again.');
                    setOpenSnackbar('error');
                },
            });
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async (e, adminId) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/admin?account=${adminId}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (response.ok) {
                setMessage(result.message);
                refreshData();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error(error)
        }
    };

    const handleAssignRole = async (e, adminId) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/admin/${adminId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: selectedRole }),
            });
            const result = await response.json();

            if (response.ok) {
                setOpenSnackbar('success');
                setMessage('Role assigned successfully!')
                setRoleModal(null); // Close modal
                refreshData(); // Refresh the data
            } else {
                alert(result.message || 'Failed to assign role.');
            }
        } catch (error) {
            console.error('Error assigning role:', error);
            alert('An error occurred while assigning the role.');
        }
    };


    return (
        <>
            <TitleBreadcrumbs title="Manage Admin Users" text="Admin Users" />

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Card sx={{ mt: 2, borderTop: '3px solid #3f51b5' }}>
                        <Box sx={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Input startDecorator={<Search />} />
                            {
                                session?.user?.roleName === "Super Admin" &&
                                <Button component="label">
                                    Import Data
                                    <input
                                        type="file"
                                        accept=".csv"
                                        hidden
                                        onChange={handleFileUpload}
                                    />
                                </Button>
                            }
                            <Modal open={loading} onClose={() => { }} disableEscapeKeyDown>
                                <ModalDialog sx={{ alignItems: 'center', padding: '1rem' }}>
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
                                    overflowX: 'auto', // Enables horizontal scrolling
                                    borderRadius: 2,
                                    '@media (max-width: 600px)': {
                                        maxWidth: '100vw', // Ensure it doesn't exceed the screen width
                                    },
                                }}
                            >
                                <Table
                                    stickyHeader
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 2,
                                        minWidth: 650, // Set a minimum width to maintain table structure
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: isXs ? '150px' : '250px' }}>Name</TableCell>
                                            <TableCell sx={{ width: isXs ? '300px' : '400px' }}>Email Address</TableCell>
                                            <TableCell sx={{ width: isXs ? '100px' : '200px' }}>Role</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.length > 0 ? (
                                            users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ width: isXs ? '150px' : '250px' }}>{user.firstname} {user.lastname}</TableCell>
                                                    <TableCell sx={{ width: isXs ? '300px' : '400px' }}>{user.emailAddress}</TableCell>
                                                    <TableCell sx={{ width: isXs ? '100px' : '200px' }}>
                                                        <Chip
                                                            color={user.role ? 'primary' : 'warning'}
                                                            variant="outlined"
                                                            onClick={() => {
                                                                setSelectedRole(user.role ? user.role._id : '');
                                                                setRoleModal(user._id);
                                                            }}
                                                        >
                                                            {user.role ? user.role.name : 'Assign Role'}
                                                        </Chip>
                                                        <Modal open={roleModal === user._id} onClose={() => setRoleModal(null)}>
                                                            <ModalDialog>
                                                                <ModalClose />
                                                                <Typography level="h4" sx={{ mb: 2 }}>
                                                                    {user.role ? 'Change' : 'Assign'} Role
                                                                </Typography>
                                                                <form onSubmit={(e) => handleAssignRole(e, user._id)}>
                                                                    <FormControl required sx={{ mb: 2 }}>
                                                                        <FormLabel>Role</FormLabel>
                                                                        <Select
                                                                            placeholder="Select a role"
                                                                            value={selectedRole} // Bind this to the selected role
                                                                            onChange={(e, newValue) => setSelectedRole(newValue)} // Update state on change
                                                                        >
                                                                            {roles.map((role) => (
                                                                                <Option key={role._id} value={role._id}>
                                                                                    {role.name}
                                                                                </Option>
                                                                            ))}
                                                                        </Select>
                                                                    </FormControl>
                                                                    {selectedRole === user.role?._id && (
                                                                        <Typography level="body2" color="warning" sx={{ mb: 2 }}>
                                                                            You selected the current role. Please select a different role to update.
                                                                        </Typography>
                                                                    )}
                                                                    <Button disabled={!selectedRole || selectedRole === user.role?._id} type="submit" color="primary" fullWidth>
                                                                        Assign
                                                                    </Button>
                                                                </form>
                                                            </ModalDialog>
                                                        </Modal>
                                                    </TableCell>
                                                    <TableCell>
                                                        {session.user.id !== user._id && (
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <Button onClick={() => setOpen(user._id)} disabled={session?.user?.roleName !== 'Super Admin'} sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' } }} color="danger">Delete</Button>
                                                                <Button onClick={() => setOpen(user._id)} disabled={session?.user?.roleName !== 'Super Admin'} size="small" sx={{ display: { xs: 'block', sm: 'block', md: 'none', lg: 'none' } }} color="danger">
                                                                    <DeleteIcon />
                                                                </Button>
                                                                <Modal open={open === user._id} onClose={() => setOpen(null)}>
                                                                    <ModalDialog>
                                                                        <ModalClose aria-label="Close" sx={{ top: '16px', right: '16px' }} />
                                                                        <Typography level="h3" fontWeight="700" sx={{ mb: 2 }}>
                                                                            Delete Admin
                                                                        </Typography>
                                                                        <Typography align="center" sx={{ mb: 3 }}>
                                                                            Are you sure you want to delete this admin? This action cannot be undone.
                                                                        </Typography>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                                                            <Button fullWidth onClick={(e) => handleDelete(e, user._id)} color="danger" aria-label="Confirm delete">
                                                                                Confirm
                                                                            </Button>
                                                                            <Button fullWidth onClick={() => setOpen(null)} variant="outlined" aria-label="Cancel delete">
                                                                                Cancel
                                                                            </Button>
                                                                        </Box>
                                                                    </ModalDialog>
                                                                </Modal>
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">Loading users...</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={5}
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
                color={openSnackbar === 'success' ? 'success' : 'danger'}
                onClose={() => setOpenSnackbar(null)}
            >
                {message}
            </Snackbar>
        </>
    );
}

export default ViewAdminUsers;
