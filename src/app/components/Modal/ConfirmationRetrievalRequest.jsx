'use client'

import { Modal, ModalClose, ModalDialog, Typography, Box, Button } from '@mui/joy'
import React, { useState } from 'react'

const ConfirmationRetrievalRequest = ({ open, onClose, item, matched }) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e, foundItemId, lostItemId) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        try {
            setLoading(true)
            const foundResponse = await fetch(`/api/found-items/${foundItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'Claim Request',
                    matched: lostItemId,
                }),
            });
    
            if (!foundResponse.ok) throw new Error('Failed to update status');

            onClose();
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
            <Typography>Send a retrieval request to {item.monitoredBy.role.name}?</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button disabled={loading} loading={loading} onClick={(e) => handleSubmit(e, item._id, matched._id)} fullWidth>Send</Button>
                <Button disabled={loading} loading={loading} onClick={onClose} fullWidth color="danger">Abort</Button>
            </Box>
        </ModalDialog>
    </Modal>
  )
}

export default ConfirmationRetrievalRequest