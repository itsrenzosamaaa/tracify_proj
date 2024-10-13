'use client'

import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, FormLabel, Input, FormControl, Button, Card, CardContent, Stack, Select, Option } from '@mui/joy';
import { Grid, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material';

const Page = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
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

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles');
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

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
                setFirstname('');
                setLastname('');
                setUsername('');
                setPassword('');
                setContactNumber('');
                setEmailAddress('');
                setSelectedRole('');
                fetchUsers();
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

    return (
        <>
            <Box
                sx={{
                    marginTop: '60px', // Ensure space for header
                    marginLeft: { xs: '0px', lg: '250px' }, // Shift content when sidebar is visible on large screens
                    padding: '20px',
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <Grid container spacing={2}>
                    <Grid item lg={7} xs={12}>
                        <Box sx={{ mt: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography level='h4' gutterBottom>Manage Users</Typography>
                            </Box>
                            <Card sx={{ height: '426px' }}> {/* Increased height for better scrollable area */}
                                <CardContent sx={{ padding: 0 }}>
                                    <Box sx={{ height: '380px', overflowY: 'auto' }}> {/* Fixed height and scroll for table */}
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
                                                    <TableCell sx={{ width: { xs: '40%', lg: '20%' } }}>Name</TableCell>
                                                    <TableCell sx={{ width: '40%', display: { xs: 'none', lg: 'table-cell' } }}>Email Address</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {users.length > 0 ? (
                                                    users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell sx={{ width: { xs: '40%', lg: '20%' } }}>{user.firstname} {user.lastname}</TableCell>
                                                            <TableCell sx={{ width: '40%', display: { xs: 'none', lg: 'table-cell' } }}>{user.emailAddress}</TableCell>
                                                            <TableCell>
                                                                <Button>Edit</Button>
                                                                <Button color="danger">Delete</Button>
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
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <FormControl fullWidth>
                                                    <FormLabel>Username</FormLabel>
                                                    <Input
                                                        name="username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                </FormControl>
                                                <FormControl fullWidth>
                                                    <FormLabel>Password</FormLabel>
                                                    <Input
                                                        name="password"
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </FormControl>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <FormControl fullWidth>
                                                    <FormLabel>First Name</FormLabel>
                                                    <Input
                                                        name="firstname"
                                                        value={firstname}
                                                        onChange={(e) => setFirstname(e.target.value)}
                                                        required
                                                    />
                                                </FormControl>
                                                <FormControl fullWidth>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <Input
                                                        name="lastname"
                                                        value={lastname}
                                                        onChange={(e) => setLastname(e.target.value)}
                                                        required
                                                    />
                                                </FormControl>
                                            </Box>
                                            <FormControl>
                                                <FormLabel>Contact Number</FormLabel>
                                                <Input
                                                    name="contactNumber"
                                                    value={contactNumber}
                                                    onChange={(e) => setContactNumber(e.target.value)}
                                                    required
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel>Email Address</FormLabel>
                                                <Input
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
                                                    name="role"
                                                    value={selectedRole}
                                                    onChange={(e, value) => setSelectedRole(value)}
                                                    required
                                                >
                                                    {roles.length > 0 ? (
                                                        roles.map(role => (
                                                            <Option key={role._id} value={role.name}>
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

                                            <Button type="submit" fullWidth>Add User</Button>
                                        </Stack>
                                    </form>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}

export default Page;
