'use client'

import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, Stack, FormLabel, Input, FormControl, Button, Chip, Modal, ModalDialog, ModalClose, DialogContent } from '@mui/joy';
import { Card, Grid, CardContent, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
    const [roles, setRoles] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch('/api/roles');
                const data = await response.json();
                setRoles(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchRoles();
    }, [])

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
                        <Box sx={{ mt: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography level='h4' gutterBottom>Manage Roles</Typography>
                                <Button onClick={() => router.push('roles/add_role')} startDecorator={<AddIcon />}>Add Role</Button>
                            </Box>
                            <Card>
                                <CardContent>
                                    <Table
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
                                                <TableCell sx={{ width: '20%' }}>Role</TableCell>
                                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>User Type</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {roles ? (
                                                roles.map(role => (
                                                    <TableRow key={role._id}>
                                                        <TableCell sx={{ width: '20%' }}>{role.name}</TableCell>
                                                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                                                            {role.userType}
                                                        </TableCell>
                                                        <TableCell sx={{ display: 'flex', gap: 1 }}>
                                                            <Button onClick={() => setOpen(true)}>View Permissions</Button>
                                                            <Button>Edit</Button>
                                                            <Button color="danger">Delete</Button>
                                                            <Modal open={open} onClose={() => setOpen(false)}>
                                                                <ModalDialog>
                                                                    <Typography level="h4">Permissions List</Typography>
                                                                    <ModalClose />
                                                                    <DialogContent>
                                                                        {Object.entries(role.permissions).map(([key, value]) => (
                                                                            value ? <Chip key={key}>{key} </Chip> : null
                                                                        ))}
                                                                    </DialogContent>
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
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}

export default Page;
