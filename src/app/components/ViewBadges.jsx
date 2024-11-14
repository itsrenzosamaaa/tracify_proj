'use client'

import React, { useState } from 'react';
import { Snackbar, Box, Typography, Button, Card, CardContent, Modal, ModalDialog, ModalClose } from '@mui/joy';
import { Grid, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import AddIcon from '@mui/icons-material/Add';
import AddBadgeModal from './Modal/AddBadge';
import PreviewBadge from './PreviewBadge';
import EditBadgeModal from './Modal/EditBadge';

const ViewBadges = ({ session, badges, fetchBadges }) => {
    const [modal, setModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/badge/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setOpenDeleteModal(null);
                setOpenSnackbar(true);
                await fetchBadges();
            } else {
                const data = await response.json();
                alert(`Failed to delete badge: ${data.message}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }
    }

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
                            <AddBadgeModal open={modal} onClose={() => setModal(false)} refreshData={fetchBadges} />
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
                                                <TableCell sx={{ width: { xs: '30%', md: '20%' } }}>Image</TableCell>
                                                {/* Title column: width adjusted for xs and lg */}
                                                <TableCell sx={{ width: { xs: '30%', md: '20%' } }}>Condition</TableCell>
                                                {/* Actions column */}
                                                <TableCell sx={{ width: { xs: '30%', md: '20%' } }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                badges.map(badge => (
                                                    <TableRow key={badge._id}>
                                                        {/* Image cell: hidden on xs and sm */}
                                                        <TableCell sx={{ width: { xs: '30%', md: '20%' } }}>
                                                            <Box sx={{ width: '150px', height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                                <PreviewBadge
                                                                    title={badge.title}
                                                                    titleColor={badge.titleColor}
                                                                    titleShimmer={badge.titleShimmer}
                                                                    titleOutlineColor={badge.titleOutlineColor}
                                                                    description={badge.description}
                                                                    shape={badge.shape}
                                                                    shapeColor={badge.shapeColor}
                                                                    bgShape={badge.bgShape}
                                                                    bgColor={badge.bgColor}
                                                                    bgOutline={badge.bgOutline}
                                                                />
                                                            </Box>
                                                        </TableCell>
                                                        {/* Title cell */}
                                                        <TableCell>{badge.meetConditions} {badge.condition}</TableCell>
                                                        {/* Actions: stack buttons vertically on smaller screens */}
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                                                                <Button size="small" onClick={() => setOpenEditModal(badge._id)}>Edit</Button>
                                                                <EditBadgeModal open={openEditModal} onClose={() => setOpenEditModal(null)} refreshData={fetchBadges} badge={badge} />
                                                                <Button size="small" color="danger" onClick={() => setOpenDeleteModal(badge._id)}>Delete</Button>
                                                                <Modal open={openDeleteModal === badge._id} onClose={() => setOpenDeleteModal(null)}>
                                                                    <ModalDialog>
                                                                        <ModalClose />
                                                                        <Typography level="h4">Delete Badge</Typography>
                                                                        <Typography>Are you sure you want to delete badge?</Typography>
                                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                                            <Button loading={loading} disabled={loading} fullWidth variant="outlined" onClick={() => setOpenDeleteModal(null)}>Cancel</Button>
                                                                            <Button loading={loading} disabled={loading} fullWidth color="danger" onClick={(e) => handleDelete(e, badge._id)}>Delete</Button>
                                                                        </Box>
                                                                    </ModalDialog>
                                                                </Modal>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </Box>
                                <Snackbar
                                    autoHideDuration={5000}
                                    open={openSnackbar}
                                    variant="solid"
                                    color="success"
                                    onClose={(event, reason) => {
                                        if (reason === 'clickaway') {
                                            return;
                                        }
                                        setOpenSnackbar(false);
                                    }}
                                >
                                    Badge has been removed successfully!
                                </Snackbar>
                                <TablePagination
                                    component="div"
                                    count={badges.length}
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
