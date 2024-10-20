'use client'

import React, { useState } from 'react';
import { Box, Typography, FormLabel, Input, FormControl, Button, Card, CardContent, Stack, Select, Option } from '@mui/joy';
import { Grid, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';

const ViewUsers = ({ users, roles, fetchUsers, session }) => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            firstname,
            lastname,
            username,
            password,
            contactNumber,
            emailAddress,
            role: selectedRole,
        };

        try {
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('User created successfully');
                // Reset fields
                setFirstname('');
                setLastname('');
                setUsername('');
                setPassword('');
                setContactNumber('');
                setEmailAddress('');
                setSelectedRole('');
                fetchUsers(); // Refresh users list after adding a new one
            } else {
                alert('Error creating user');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle the case where session or session.user may be undefined
    const isAddUserAllowed = session?.user?.roleData?.addUser ?? false;

    return (
        <>
            <TitleBreadcrumbs title="Manage Users" text="Users" />

            <Grid container spacing={2}>
                <Grid item lg={7} xs={12}>
                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography level='h4' gutterBottom>View Users</Typography>
                        </Box>
                        <Card sx={{ height: '426px' }}>
                            <CardContent sx={{ padding: 0 }}>
                                <Box sx={{ height: '380px', overflowY: 'auto' }}>
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
                                                <TableCell>Name</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users.length > 0 ? (
                                                users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{user.firstname} {user.lastname}</TableCell>
                                                        <TableCell>{roles.map(role => role._id === user.role ? role.name : '')}</TableCell>
                                                        <TableCell>
                                                            {session.user.id !== user._id && (
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    {/* Full buttons for larger screens */}
                                                                    <Button disabled={!session?.user?.roleData?.editUser} sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' } }}>Edit</Button>
                                                                    <Button disabled={!session?.user?.roleData?.deleteUser} sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' } }} color="danger">Delete</Button>

                                                                    {/* Icon buttons for smaller screens */}
                                                                    <Button disabled={!session?.user?.roleData?.editUser} size="small" sx={{ display: { xs: 'block', sm: 'block', md: 'none', lg: 'none' } }}>
                                                                        <EditIcon />
                                                                    </Button>
                                                                    <Button disabled={!session?.user?.roleData?.deleteUser} size="small" sx={{ display: { xs: 'block', sm: 'block', md: 'none', lg: 'none' } }} color="danger">
                                                                        <DeleteIcon />
                                                                    </Button>
                                                                </Box>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center">Loading users...</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                                <TablePagination
                                    component="div"
                                    count={users.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>
                <Grid item lg={5} xs={12}>
                    <Box sx={{ mt: 4 }}>
                        <Typography level="h4" gutterBottom>Add New User</Typography>
                        <Card>
                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    <Stack spacing={2}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                            <Grid container spacing={2} sx={{ width: '100%' }}>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <FormLabel>Username</FormLabel>
                                                        <Input
                                                            disabled={!isAddUserAllowed}
                                                            name="username"
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            required
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <FormLabel>Password</FormLabel>
                                                        <Input
                                                            disabled={!isAddUserAllowed}
                                                            name="password"
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required
                                                        />
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            <Grid container spacing={2} sx={{ width: '100%', marginTop: '6px' }}>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <FormLabel>First Name</FormLabel>
                                                        <Input
                                                            disabled={!isAddUserAllowed}
                                                            name="firstname"
                                                            value={firstname}
                                                            onChange={(e) => setFirstname(e.target.value)}
                                                            required
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <Input
                                                            disabled={!isAddUserAllowed}
                                                            name="lastname"
                                                            value={lastname}
                                                            onChange={(e) => setLastname(e.target.value)}
                                                            required
                                                        />
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <FormControl>
                                            <FormLabel>Contact Number</FormLabel>
                                            <Input
                                                disabled={!isAddUserAllowed}
                                                name="contactNumber"
                                                value={contactNumber}
                                                onChange={(e) => setContactNumber(e.target.value)}
                                                required
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Email Address</FormLabel>
                                            <Input
                                                disabled={!isAddUserAllowed}
                                                name="email"
                                                type="email"
                                                value={emailAddress}
                                                onChange={(e) => setEmailAddress(e.target.value)}
                                                required
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Role</FormLabel>
                                            <Select
                                                disabled={!isAddUserAllowed}
                                                name="role"
                                                value={selectedRole}
                                                onChange={(e, value) => setSelectedRole(value)}
                                                required
                                            >
                                                {roles.length > 0 ? (
                                                    roles.map(role => (
                                                        <Option key={role._id} value={role._id}>
                                                            {role.name}
                                                        </Option>
                                                    ))
                                                ) : (
                                                    <Option value="" disabled>
                                                        No roles available
                                                    </Option>
                                                )}
                                            </Select>
                                        </FormControl>

                                        <Button disabled={!isAddUserAllowed} type="submit" fullWidth>Add User</Button>
                                    </Stack>
                                </form>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>
            </Grid>
        </>
    );
}

export default ViewUsers;
