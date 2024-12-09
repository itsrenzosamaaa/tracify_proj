'use client'

import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Modal, ModalDialog, CircularProgress } from '@mui/joy';
import { Grid, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import Papa from 'papaparse';

const ViewUsers = ({ users, refreshData }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [loading, setLoading] = useState(false);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            Papa.parse(file, {
                header: true, // Use headers from the first row of the CSV
                skipEmptyLines: true, // Skip blank lines
                complete: async (results) => {
                    try {
                        console.log("Parsed CSV: ", results.data)
                        setLoading(true);
                        // Post parsed data to the server
                        const response = await fetch('/api/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(results.data),
                        });

                        const result = await response.json();

                        if (!response.ok) {
                            throw new Error(result.error || 'Failed to import users');
                        }

                        console.log(`${result.count} users imported successfully!`);
                        refreshData(); // Refresh the list of users
                    } catch (error) {
                        console.error('Error importing users:', error.message);
                    } finally {
                        setLoading(false)
                    }
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                },
            });
        }
    };

    return (
        <>
            <TitleBreadcrumbs title="Manage Users" text="Users" />

            <Grid container spacing={2}>
                <Grid item lg={12} xs={12}>
                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography level='h4' gutterBottom>View Users</Typography>
                            <Button component="label">
                                Import Data
                                <input
                                    type="file"
                                    accept=".csv"
                                    hidden
                                    onChange={handleFileUpload}
                                />
                            </Button>
                            <Modal open={loading} onClose={() => { }} disableEscapeKeyDown>
                                <ModalDialog sx={{ alignItems: 'center', padding: '1rem' }}>
                                    <Typography level="body-lg" fontWeight={700} gutterBottom>
                                        Importing students data...
                                    </Typography>
                                    <CircularProgress />
                                </ModalDialog>
                            </Modal>
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
                                                <TableCell sx={{ display: { xs: 'none', lg: 'block' } }}>Email</TableCell>
                                                <TableCell>Contact No.</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users.length > 0 ? (
                                                users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{user.firstname} {user.lastname}</TableCell>
                                                        <TableCell sx={{ display: { xs: 'none', lg: 'block' } }}>{user.emailAddress}</TableCell>
                                                        <TableCell>{user.contactNumber}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center">No users found...</TableCell>
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

export default ViewUsers;
