'use client'

import React, { useState } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Modal, ModalDialog, CircularProgress, Snackbar,
    Input, Table
} from '@mui/joy';
import { Grid, TableContainer, TableHead, TableBody, TableRow, TableCell, TablePagination, useTheme, useMediaQuery } from '@mui/material';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import Papa from 'papaparse';
import { Search } from '@mui/icons-material';

const ViewUsers = ({ users, refreshData, session }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

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
                        setLoading(true);
                        const response = await fetch('/api/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(results.data),
                        });

                        const result = await response.json();

                        if (!response.ok) {
                            throw new Error(result.error || 'Failed to import users');
                        }

                        refreshData(); // Refresh the list of users
                        setOpenSnackbar('success');
                    } catch (error) {
                        setErrorMessage(error.message || 'An error occurred while importing users.');
                        setOpenSnackbar('error');
                    } finally {
                        setLoading(false);
                    }
                },
                error: (error) => {
                    setErrorMessage('Error parsing CSV file. Please try again.');
                    setOpenSnackbar('error');
                },
            });
        }
    };

    return (
        <>
            <TitleBreadcrumbs title="Manage Users" text="Users" />

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
                                        minWidth: 650,
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: isXs ? '150px' : '250px' }}>Name</TableCell>
                                            <TableCell sx={{ width: isXs ? '300px' : '400px' }}>Email</TableCell>
                                            <TableCell sx={{ width: isXs ? '100px' : '200px' }}>Contact No.</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.length > 0 ? (
                                            users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ width: isXs ? '150px' : '250px' }}>{user.firstname} {user.lastname}</TableCell>
                                                    <TableCell sx={{ width: isXs ? '300px' : '400px' }}>{user.emailAddress}</TableCell>
                                                    <TableCell sx={{ width: isXs ? '100px' : '200px' }}>{user.contactNumber}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">No users found...</TableCell>
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
            </Grid >
            <Snackbar
                autoHideDuration={5000}
                open={openSnackbar}
                variant="solid"
                color={openSnackbar === 'success' ? 'success' : 'danger'}
                onClose={() => setOpenSnackbar(null)}
            >
                {openSnackbar === 'success' ? "Users imported successfully!" : errorMessage}
            </Snackbar>
        </>
    );
};

export default ViewUsers;
