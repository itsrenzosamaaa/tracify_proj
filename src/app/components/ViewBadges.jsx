'use client'

import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/joy';
import { Grid, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import AddIcon from '@mui/icons-material/Add';
import AddBadgeModal from './Modal/AddBadge';

const ViewBadges = ({ session, badges }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [modal, setModal] = useState(false);

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

    const isAddBadgesAllowed = session?.user?.permissions?.addBadge ?? false;

    return (
        <>
            <TitleBreadcrumbs title="Manage Badges" text="Badges" />
            <Grid container spacing={2}>
                <Grid item lg={12} xs={12}>
                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography level='h4' gutterBottom>View Badges</Typography>
                            <Button startDecorator={<AddIcon />} onClick={() => setModal(true)}>Add Badge</Button>
                            <AddBadgeModal open={modal} onClose={() => setModal(false)} />
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
                                                {/* Image column: hidden on xs and sm screens */}
                                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, width: { md: '15%' } }}>Image</TableCell>
                                                {/* Title column: width adjusted for xs and lg */}
                                                <TableCell sx={{ width: { xs: '70%', md: '40%' } }}>Title</TableCell>
                                                {/* Actions column */}
                                                <TableCell sx={{ width: { xs: '30%', md: '20%' } }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                {/* Image cell: hidden on xs and sm */}
                                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Image Content</TableCell>
                                                {/* Title cell */}
                                                <TableCell>Sample Title</TableCell>
                                                {/* Actions: stack buttons vertically on smaller screens */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                                                        <Button size="small">View</Button>
                                                        <Button size="small">Edit</Button>
                                                        <Button size="small" color="danger">Delete</Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Box>
                                <TablePagination
                                    component="div"
                                    count={badges}
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

export default ViewBadges;
