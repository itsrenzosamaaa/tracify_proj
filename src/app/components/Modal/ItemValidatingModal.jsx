'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, Snackbar } from '@mui/joy';
import React, { useState } from 'react';
import ItemDetails from './ItemDetails';

const ItemValidatingModal = ({ row, open, onClose, refreshData }) => {
    const [itemValidate, setItemValidate] = useState(null);
    const [itemInvalidate, setItemInvalidate] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleSubmit = async (e, id) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        try {
            const response = await fetch(`/api/found-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Published' }),
            });

            if (!response.ok) throw new Error('Failed to update status');
            alert('success');
            onClose();
            refreshData();
        } catch (error) {
            console.error(error)
        }
    }

    const handleInvalid = async (e, id) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        try {
            const response = await fetch(`/api/found-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Invalid', reason: "The finder failed to surrender the item." }),
            });

            if (!response.ok) throw new Error('Failed to update status');
            alert('success');
            onClose();
            refreshData();
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <Modal open={open === row._id} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Validation Pending
                    </Typography>
                    <ItemDetails row={row} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button color="danger" onClick={() => setItemInvalidate(row.item._id)} fullWidth>Invalid</Button>
                        <Button onClick={() => setItemValidate(row.item._id)} fullWidth>Publish</Button>
                        <Modal open={itemValidate} onClose={() => setItemValidate(null)}>
                            <ModalDialog>
                                <ModalClose />
                                <Typography level="h4" gutterbottom>Confirmation</Typography>
                                <Typography>Are you you want to publish the item?</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button color="danger" onClick={() => setItemValidate(null)} fullWidth>Cancel</Button>
                                    <Button onClick={(e) => handleSubmit(e, row.item._id)} fullWidth>Confirm</Button>
                                </Box>
                            </ModalDialog>
                        </Modal>
                        <Modal open={itemInvalidate} onClose={() => setItemInvalidate(null)}>
                            <ModalDialog>
                                <ModalClose />
                                <Typography level="h4" gutterbottom>Invalidation</Typography>
                                <Typography>Did the finder failed to surrender the item?</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => setItemInvalidate(null)} fullWidth>Cancel</Button>
                                    <Button color="danger" onClick={(e) => handleInvalid(e, row.item._id)} fullWidth>Confirm</Button>
                                </Box>
                            </ModalDialog>
                        </Modal>
                    </Box>
                </ModalDialog>
            </Modal>
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
                Item has been invalidated...
            </Snackbar>
        </>
    );
};

export default ItemValidatingModal;
