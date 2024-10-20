'use client'

import React, { useState } from 'react';
import { Box, Typography, FormLabel, Input, FormControl, Button, Card, CardContent, Stack, Select, Option, Textarea, FormHelperText } from '@mui/joy';
import { Grid, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import { useDropzone } from 'react-dropzone';
import Image from "next/image";

const ViewBadges = ({ users = [], roles, session }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleSubmit = async (e) => {
        e.preventDefault();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0]; // Get the first selected file
        if (file) {
            const validImageTypes = ['image/png'];
            if (validImageTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImage(reader.result); // Set the image state to the base64 URL for preview
                };
                reader.readAsDataURL(file); // Convert the file to base64 URL
            } else {
                alert('Please upload a valid image file (PNG)');
                setImage(null);
            }
        } else {
            setImage(null);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    // Handle the case where session or session.user may be undefined
    const isAddBadgesAllowed = session?.user?.roleData?.addBadges ?? false;

    return (
        <>
            <TitleBreadcrumbs title="Manage Badges" text="Badges" />
            <Grid container spacing={2}>
                <Grid item lg={7} xs={12}>
                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography level='h4' gutterBottom>Manage Badges</Typography>
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
                                                <TableCell sx={{ width: { xs: '30%', lg: '20%' } }}>Name</TableCell>
                                                <TableCell sx={{ width: { xs: '30%', lg: '20%' } }}>Role</TableCell>
                                                <TableCell sx={{ width: { lg: '30%' }, display: { xs: 'none', lg: 'table-cell' } }}>Email Address</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {/* {users.length > 0 ? (
                                                users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell sx={{ width: { xs: '30%', lg: '20%' } }}>{user.firstname} {user.lastname}</TableCell>
                                                        <TableCell sx={{ width: { xs: '30%', lg: '20%' } }}>{roles.map(role => role._id === user.role ? role.name : '')}</TableCell>
                                                        <TableCell sx={{ width: { lg: '30%' }, display: { xs: 'none', lg: 'table-cell' } }}>{user.emailAddress}</TableCell>
                                                        <TableCell>
                                                            {session.user.id !== user._id && (
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    <Button sx={{ display: { xs: 'none', lg: 'block' } }}>Edit</Button>
                                                                    <Button sx={{ display: { xs: 'none', lg: 'block' } }} color="danger">Delete</Button>

                                                                    <Button size="small" sx={{ display: { xs: 'block', lg: 'none' } }}>
                                                                        <EditIcon />
                                                                    </Button>
                                                                    <Button size="small" sx={{ display: { xs: 'block', lg: 'none' } }} color="danger">
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
                                            )} */}
                                        </TableBody>
                                    </Table>
                                </Box>
                                <TablePagination
                                    component="div"
                                    count={users}
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
                        <Typography level="h4" gutterBottom>Add New Badge</Typography>
                        <Card>
                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    <Stack spacing={2}>
                                        <FormControl>
                                            <FormLabel>Badge Name</FormLabel>
                                            <Input
                                                disabled={!isAddBadgesAllowed}
                                                name="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Badge Description</FormLabel>
                                            <Textarea
                                                disabled={!isAddBadgesAllowed}
                                                name="description"
                                                type="text"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                required
                                            />
                                            <FormHelperText>Provide a description on how users can obtain this badge.</FormHelperText>
                                        </FormControl>
                                        <FormControl>
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                <FormLabel>Upload Image</FormLabel>
                                                {image && <Button size="sm" color="danger" onClick={() => setImage(null)}>Discard</Button>}
                                            </Box>
                                            {!image ? (
                                                <Box
                                                    {...getRootProps({
                                                        className: 'dropzone',
                                                        disabled: !isAddBadgesAllowed,
                                                        onClick: isAddBadgesAllowed ? undefined : (e) => e.preventDefault(),
                                                    })}
                                                    sx={{
                                                        border: '2px dashed #888',
                                                        borderRadius: '4px',
                                                        padding: '20px',
                                                        textAlign: 'center',
                                                        cursor: isAddBadgesAllowed ? 'pointer' : 'default',
                                                        backgroundColor: image ? 'transparent' : '#f9f9f9',
                                                    }}
                                                >
                                                    <input {...getInputProps()} disabled={!isAddBadgesAllowed} />
                                                    <p>{!isAddBadgesAllowed ? "You cannot upload an image due to user permissions" : "Drag and drop some files here, or click to select files"}</p>
                                                </Box>
                                            ) : (
                                                <Image
                                                    src={image}
                                                    width={0}
                                                    height={0}
                                                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    style={{ width: '100%', height: 'auto', objectFit: 'cover', marginBottom: '1rem' }}
                                                    alt="Preview"
                                                />
                                            )}
                                        </FormControl>

                                        <Button disabled={!isAddBadgesAllowed} type="submit" fullWidth>Add Badge</Button>
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

export default ViewBadges;
