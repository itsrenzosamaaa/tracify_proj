'use client'

import React, { useState } from 'react';
import { Box, Typography, FormLabel, Input, FormControl, Button, Card, CardContent, Stack, Select, Option, Modal, ModalDialog, ModalClose } from '@mui/joy';
import { Grid, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';

const ViewStudentsUser = ({ users, fetchStudentUsers, session }) => {
    const [editingUserId, setEditingUserId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [schoolCategory, setSchoolCategory] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [open, setOpen] = useState(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const accountFormData = {
            username,
            password,
            emailAddress,
            type: 'student',
            date_created: new Date(),
        };

        const studentFormData = {
            firstname,
            lastname,
            contactNumber,
            school_category: schoolCategory,
            account: '', // Will be set after account creation
        };

        try {
            if (isEditMode && editingUserId) {
                // Update existing admin user
                const studentUpdateResponse = await fetch(`/api/student-users/${editingUserId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...accountFormData, ...studentFormData }),
                });

                if (studentUpdateResponse.ok) {
                    alert('Student user updated successfully');
                    resetForm();
                    fetchStudentUsers(); // Refresh the list of users
                } else {
                    alert('Error updating student user');
                }
            } else {
                // First, create the account and retrieve its _id
                const accountResponse = await fetch('/api/accounts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(accountFormData),
                });

                const accountData = await accountResponse.json();

                if (accountData.success) {
                    // Use the _id from accountData to set accountId in studentFormData
                    studentFormData.account = accountData._id;

                    // Now, create the admin with the account _id
                    const adminResponse = await fetch('/api/student-users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(studentFormData),
                    });

                    if (adminResponse.ok) {
                        alert('Student user created successfully');
                        resetForm();
                        fetchStudentUsers(); // Refresh the list of users
                    } else {
                        alert('Error creating student user');
                    }
                } else {
                    alert('Error creating account');
                }
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while creating/updating the user');
        }
    };

    // Function to reset the form after submission or cancelation
    const resetForm = () => {
        setFirstname('');
        setLastname('');
        setUsername('');
        setPassword('');
        setContactNumber('');
        setEmailAddress('');
        setSchoolCategory('');
        setIsEditMode(false); // Exit edit mode after submission
        setEditingUserId(null);
    };

    const cancelEdit = () => {
        resetForm();
        setIsEditMode(false);
    }

    // Function to handle the Edit button click and populate form with user data
    const handleEdit = (user) => {
        setIsEditMode(true);
        setEditingUserId(user._id); // Track the user being edited
        setFirstname(user.firstname);
        setLastname(user.lastname);
        setUsername(user.account.username);
        setPassword(''); // You might want to leave this empty for security reasons
        setContactNumber(user.contactNumber);
        setEmailAddress(user.account.emailAddress);
        setSchoolCategory(user.school_category);
    };

    const handleDelete = async (accountId) => {
        try {
            // Step 1: Delete the admin associated with the accountId
            const studentDeleteResponse = await fetch(`/api/student-users?account=${accountId}`, {
                method: 'DELETE',
            });

            const studentData = await studentDeleteResponse.json();

            if (studentData.success) {
                // Step 2: Delete the account after deleting the admin
                const accountDeleteResponse = await fetch(`/api/accounts?account=${accountId}`, {
                    method: 'DELETE',
                });

                const accountData = await accountDeleteResponse.json();

                if (accountData.success) {
                    alert('Account and Admin deleted successfully');
                    // Refresh the user list or redirect as needed
                    fetchStudentUsers(); // Example function to refresh list of users
                } else {
                    alert('Error deleting account');
                }
            } else {
                alert('Error deleting admin');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while deleting the account and admin');
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
    const isAddStudentAllowed = session?.user?.roleData?.addStudent ?? false;

    return (
        <>
            <TitleBreadcrumbs title="Manage Student Users" text="Student Users" />

            <Grid container spacing={2}>
                <Grid item lg={7} xs={12}>
                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography level='h4' gutterBottom>View Student Users</Typography>
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
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users.length > 0 ? (
                                                users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{user.firstname} {user.lastname}</TableCell>
                                                        <TableCell>
                                                            {session.user.id !== user._id && (
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    {/* Full buttons for larger screens */}
                                                                    <Button onClick={() => handleEdit(user)} disabled={!session?.user?.roleData?.editStudent} sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' } }}>Edit</Button>
                                                                    <Button onClick={() => setOpen(user._id)} disabled={!session?.user?.roleData?.deleteStudent} sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' } }} color="danger">Delete</Button>

                                                                    {/* Icon buttons for smaller screens */}
                                                                    <Button onClick={() => handleEdit(user)} disabled={!session?.user?.roleData?.editStudent} size="small" sx={{ display: { xs: 'block', sm: 'block', md: 'none', lg: 'none' } }}>
                                                                        <EditIcon />
                                                                    </Button>
                                                                    <Button onClick={() => setOpen(user._id)} disabled={!session?.user?.roleData?.deleteStudent} size="small" sx={{ display: { xs: 'block', sm: 'block', md: 'none', lg: 'none' } }} color="danger">
                                                                        <DeleteIcon />
                                                                    </Button>
                                                                    <Modal open={open === user._id} onClose={() => setOpen(null)}>
                                                                        <ModalDialog>
                                                                            <ModalClose aria-label="Close" sx={{ top: '16px', right: '16px' }} />

                                                                            {/* Warning Title */}
                                                                            <Typography
                                                                                level="h6"
                                                                                fontWeight="700"
                                                                                align="center"
                                                                                sx={{ mb: 2 }}
                                                                            >
                                                                                Are you sure?
                                                                            </Typography>

                                                                            {/* Confirmation Message */}
                                                                            <Typography
                                                                                align="center"
                                                                                sx={{ mb: 3 }}
                                                                            >
                                                                                Are you sure you want to delete this student and their account? This action cannot be undone.
                                                                            </Typography>

                                                                            {/* Buttons Section */}
                                                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                                                                <Button
                                                                                    onClick={() => handleDelete(user.account._id)}
                                                                                    color="danger"
                                                                                    aria-label="Confirm delete"
                                                                                >
                                                                                    Confirm
                                                                                </Button>
                                                                                <Button
                                                                                    onClick={() => setOpen(null)}
                                                                                    variant="outlined"
                                                                                    aria-label="Cancel delete"
                                                                                >
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
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography level="h4" gutterBottom>{isEditMode ? 'Update Student' : 'Add New Student'}</Typography>
                            {isEditMode && <Button onClick={cancelEdit} color="danger">Cancel</Button>}
                        </Box>
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
                                                            disabled={!isAddStudentAllowed}
                                                            name="username"
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            required={!isEditMode}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <FormLabel>Password</FormLabel>
                                                        <Input
                                                            disabled={!isAddStudentAllowed}
                                                            name="password"
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required={!isEditMode}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            <Grid container spacing={2} sx={{ width: '100%', marginTop: '6px' }}>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <FormLabel>First Name</FormLabel>
                                                        <Input
                                                            disabled={!isAddStudentAllowed}
                                                            name="firstname"
                                                            value={firstname}
                                                            onChange={(e) => setFirstname(e.target.value)}
                                                            required={!isEditMode}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <Input
                                                            disabled={!isAddStudentAllowed}
                                                            name="lastname"
                                                            value={lastname}
                                                            onChange={(e) => setLastname(e.target.value)}
                                                            required={!isEditMode}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <FormControl>
                                            <FormLabel>School Category</FormLabel>
                                            <Select
                                                disabled={!isAddStudentAllowed}
                                                name="role"
                                                value={schoolCategory}
                                                onChange={(e, value) => setSchoolCategory(value)}
                                                required={!isEditMode}
                                            >
                                                <Option value="Higher Education">Higher Education</Option>
                                                <Option value="Basic Education">Basic Education</Option>
                                            </Select>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Contact Number</FormLabel>
                                            <Input
                                                disabled={!isAddStudentAllowed}
                                                name="contactNumber"
                                                value={contactNumber}
                                                onChange={(e) => setContactNumber(e.target.value)}
                                                required={!isEditMode}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Email Address</FormLabel>
                                            <Input
                                                disabled={!isAddStudentAllowed}
                                                name="email"
                                                type="email"
                                                value={emailAddress}
                                                onChange={(e) => setEmailAddress(e.target.value)}
                                                required={!isEditMode}
                                            />
                                        </FormControl>

                                        <Button disabled={!isAddStudentAllowed} type="submit" fullWidth>
                                            {isEditMode ? 'Update Student' : 'Add Student'}
                                        </Button>
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

export default ViewStudentsUser;
