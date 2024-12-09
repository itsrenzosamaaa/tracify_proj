'use client'

import React, { useState } from 'react';
import { Box, Typography, Table, Button, Chip, Modal, ModalDialog, ModalClose, DialogContent, Input } from '@mui/joy';
import { Card, Grid, CardContent, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import SearchIcon from "@mui/icons-material/Search"
import AddRole from './Modal/AddRole';

const ViewRoles = ({ roles, session, refreshData }) => {
    const [open, setOpen] = useState(null);
    const [addRole, setAddRole] = useState(false);

    return (
        <>
            <TitleBreadcrumbs title="Manage Roles" text="Roles" />
            <Grid container spacing={2}>
                <Grid item lg={12}>
                    <Box sx={{ mt: 4 }}>
                        <Typography level='h4' gutterBottom>View Roles</Typography>
                        <Card>
                            <Box sx={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Input startDecorator={<SearchIcon />} />
                                <Button onClick={() => setAddRole(true)} startDecorator={<AddIcon />}>Add Role</Button>
                                <AddRole open={addRole} onClose={() => setAddRole(false)} refreshData={refreshData} />
                            </Box>
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
                                            <TableCell sx={{ width: '30%' }}>Role</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {roles ? (
                                            roles.map(role => (
                                                <TableRow key={role._id}>
                                                    <TableCell sx={{ width: '30%' }}>{role.name}</TableCell>
                                                    <TableCell sx={{ display: 'flex', gap: 1 }}>
                                                        <Button size="small1" onClick={() => setOpen(role._id)}>View Permissions</Button>
                                                        {session.user.permissions.editRole && <Button size="small">Edit</Button>}
                                                        {session.user.permissions.deleteRole && <Button size="small" color="danger">Delete</Button>}
                                                        <Modal open={open === role._id} onClose={() => setOpen(null)}>
                                                            <ModalDialog>
                                                                <Typography level="h4">Permissions List</Typography>
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
        </>
    );
}

export default ViewRoles;
