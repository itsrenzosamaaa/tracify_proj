'use client'

import { Modal, ModalClose, ModalDialog, Typography, Box, Button, Snackbar } from '@mui/joy'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const CancelRetrievalRequest = ({ open, onClose, matchItem }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        try {
            setLoading(true)
            const foundResponse = await fetch(`/api/found-items/${matchItem.finder.item._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'Decline Retrieval',
                }),
            });

            if (!foundResponse.ok) throw new Error('Failed to update status');

            const matchResponse = await fetch(`/api/match-items/${matchItem._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_status: 'Canceled',
                }),
            });

            if (!matchResponse.ok) throw new Error('Failed to update status');

            router.push('/my-items');
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <Modal open={open === matchItem._id} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" gutterBottom>Cancel Request</Typography>
                    <Typography>Are you sure you want to cancel your retrieval request?</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button disabled={loading} loading={loading} onClick={onClose} variant="outlined" fullWidth>Close</Button>
                        <Button disabled={loading} loading={loading} onClick={(e) => handleSubmit(e)} fullWidth color="danger">Cancel</Button>
                    </Box>
                </ModalDialog>
            </Modal>
        </>
    )
}

export default CancelRetrievalRequest