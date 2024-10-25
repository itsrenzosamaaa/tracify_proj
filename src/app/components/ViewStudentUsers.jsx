'use client'

import React, { useState } from 'react';
import { Box, Typography, FormLabel, Input, FormControl, Button, Card, CardContent, Stack, Select, Option, Modal, ModalDialog, ModalClose } from '@mui/joy';
import { Grid, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import AddStudentModal from './Modal/AddStudent';

const ViewStudentsUser = ({ users, fetchStudentUsers, session }) => {
    const [editingUserId, setEditingUserId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [addModal, setAddModal] = useState(false);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);  

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

    return (
        <>
            <TitleBreadcrumbs title="Manage Student Users" text="Student Users" />

            <Grid container spacing={2}>
                <Grid item lg={12} xs={12}>
                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography level='h4' gutterBottom>View Student Users</Typography>
                            {session?.user?.permissions?.addStudent && <Button startDecorator={<AddIcon />} onClick={() => setAddModal(true)}>Add Student</Button>}
                            <AddStudentModal open={addModal} onClose={() => setAddModal(false)} />
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
                                                                    <Button disabled={!session?.user?.permissions?.editStudent} sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' } }}>Edit</Button>
                                                                    <Button onClick={() => setDeleteModal(user._id)} disabled={!session?.user?.permissions?.deleteStudent} sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' } }} color="danger">Delete</Button>

                                                                    {/* Icon buttons for smaller screens */}
                                                                    <Button disabled={!session?.user?.permissions?.editStudent} size="small" sx={{ display: { xs: 'block', sm: 'block', md: 'none', lg: 'none' } }}>
                                                                        <EditIcon />
                                                                    </Button>
                                                                    <Button onClick={() => setDeleteModal(user._id)} disabled={!session?.user?.permissions?.deleteStudent} size="small" sx={{ display: { xs: 'block', sm: 'block', md: 'none', lg: 'none' } }} color="danger">
                                                                        <DeleteIcon />
                                                                    </Button>
                                                                    <Modal open={deleteModal === user._id} onClose={() => setDeleteModal(null)}>
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
                                                                                    onClick={() => setDeleteModal(null)}
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
            </Grid>
        </>
    );
}

export default ViewStudentsUser;
