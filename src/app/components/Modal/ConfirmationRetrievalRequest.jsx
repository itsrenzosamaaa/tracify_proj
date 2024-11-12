'use client'

import { Modal, ModalClose, ModalDialog, Typography, Box, Button } from '@mui/joy'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const ConfirmationRetrievalRequest = ({ open, onClose, foundItem, lostItem }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e, foundItemId, finderId, ownerId) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const newMatch = {
            finder: finderId,
            owner: ownerId,
            status: 'Claim Request',
            dateClaimRequest: new Date(),
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
                router.push('/my-items');
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    return (
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
    )
}

export default ConfirmationRetrievalRequest