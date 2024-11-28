'use client'

import React, { useState } from 'react';
import { Snackbar, Table, Box, Typography, Button, Card, CardContent, Modal, ModalDialog, ModalClose } from '@mui/joy';
import { Grid, TableContainer, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@mui/material';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import AddIcon from '@mui/icons-material/Add';
import AddBadgeModal from './Modal/AddBadge';
import PreviewBadge from './PreviewBadge';
import EditBadgeModal from './Modal/EditBadge';
import { useTheme, useMediaQuery } from '@mui/material';

const ViewBadges = ({ session, badges, fetchBadges }) => {
    const [modal, setModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));

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
                            {isAddBadgesAllowed && (
                                <Button startDecorator={<AddIcon />} onClick={() => setModal(true)}>Add Badge</Button>
                            )}
                            <AddBadgeModal open={modal} onClose={() => setModal(false)} refreshData={fetchBadges} />
                        </Box>
                        <Box sx={{ height: '380px' }}>
                            <Card sx={{ height: '390px' }}>
                                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <TableContainer sx={{ flex: 1, maxHeight: 350 }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    {/* Image column */}
                                                    <TableCell sx={{ width: { xs: '30%', md: '20%' } }}>Image</TableCell>
                                                    {/* Condition column */}
                                                    <TableCell sx={{ width: { xs: '30%', md: '20%' } }}>Condition</TableCell>
                                                    {/* Actions column */}
                                                    <TableCell sx={{ width: { xs: '30%', md: '20%' } }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {
                                                    badges.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(badge => (
                                                        <TableRow key={badge._id}>
                                                            {/* Image cell */}
                                                            <TableCell sx={{ width: { xs: '30%', md: '20%' } }}>
                                                                <Box sx={{ width: { xs: '80px', sm: '105px', md: '130px' }, height: { xs: '80px', sm: '105px', md: '130px' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
                                                                        condition={badge.condition}
                                                                        meetConditions={badge.meetConditions}
                                                                    />
                                                                </Box>
                                                            </TableCell>
                                                            {/* Title cell */}
                                                            <TableCell>
                                                                <Typography level={isXs ? 'body-xs' : 'body-md'}>{badge.meetConditions} {badge.condition}</Typography>
                                                            </TableCell>
                                                            {/* Actions cell */}
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                                                                    <Button size={isXs ? 'small' : 'medium'} onClick={() => setOpenEditModal(badge._id)}>Edit</Button>
                                                                    <EditBadgeModal open={openEditModal === badge._id} onClose={() => setOpenEditModal(null)} refreshData={fetchBadges} badge={badge} />
                                                                    <Button size={isXs ? 'small' : 'medium'} color="danger" onClick={() => setOpenDeleteModal(badge._id)}>Delete</Button>
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
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Snackbar for success message */}
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

                        {/* Table Pagination */}
                        <TablePagination
                            component="div"
                            count={badges.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Box>
                </Grid>
            </Grid>
        </>
    );
}

export default ViewBadges;
