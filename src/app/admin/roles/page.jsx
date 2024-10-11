'use client'

import React, { useState } from 'react';
import { Box, Typography, Table, Stack, FormLabel, Input, FormControl, Button } from '@mui/joy';
import { Paper, Grid, TableContainer, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

const Page = () => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
    }

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
                    <Grid item lg={12}>
                        <Paper elevation={2} sx={{ padding: "1rem", marginBottom: 2 }}> {/* Add marginBottom for spacing */}
                            <Typography level='h4'>Add Role</Typography>
                            <form onSubmit={handleSubmit} sx={{ alignContent: 'center' }}>
                                <Box sx={{ padding: '1rem', width: '50%', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel>Name</FormLabel>
                                    <Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                                    <Button>Add Role</Button>
                                </Box>
                            </form>
                        </Paper>
                        <Paper elevation={2} sx={{ marginBottom: 2 }}> {/* Add marginBottom for spacing */}
                            <Box sx={{ padding: "1rem" }}>
                                <Typography level='h4'>Manage Roles</Typography>
                            </Box>
                            <TableContainer
                                component={Paper}
                                elevation={2}
                                sx={{
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    maxWidth: "100%",
                                    width: "100%",
                                }}
                            >
                                <Table
                                    variant="outlined"
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: '20%' }}>Role</TableCell>
                                            <TableCell sx={{ width: '50%' }}>Permissions</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ width: '20%' }}></TableCell>
                                            <TableCell sx={{ width: '50%' }}></TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}

export default Page;
