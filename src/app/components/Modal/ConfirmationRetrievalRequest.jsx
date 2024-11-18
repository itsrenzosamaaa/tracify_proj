'use client'

import { Modal, ModalClose, ModalDialog, Typography, Box, Button, Snackbar } from '@mui/joy'
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react'

const ConfirmationRetrievalRequest = ({ open, onClose, foundItem, lostItem, refreshData }) => {
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleSubmit = async (e, foundItemId, finderId, ownerId) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const newMatch = {
            finder: finderId,
            owner: ownerId,
            request_status: 'Pending',
            datePending: new Date(),
        };

        try {
            setLoading(true)
            const response = await fetch('/api/match-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMatch),
            });

            if (!response.ok) throw new Error('Failed to update status');

            const foundItemResponse = await fetch(`/api/found-items/${foundItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Matched' }),
            })

            if (response.ok && foundItemResponse.ok) {
                if (pathname === '/my-items') {
                    onClose();
                    refreshData();
                    openSnackbar(true);
                    return;
                }
                return router.push('/my-items');
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <Modal open={open} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" gutterBottom>Confirmation</Typography>
                    <Typography>Send a retrieval request to {foundItem?.item?.monitoredBy?.role?.name}?</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button disabled={loading} loading={loading} onClick={(e) => handleSubmit(e, foundItem.item._id, foundItem._id, lostItem._id)} fullWidth>Send</Button>
                        <Button disabled={loading} loading={loading} onClick={onClose} fullWidth color="danger">Abort</Button>
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
                Item retrieval request sent!
            </Snackbar>
        </>
    )
}

export default ConfirmationRetrievalRequest