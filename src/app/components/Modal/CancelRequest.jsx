'use client'

import { Modal, ModalClose, ModalDialog, Typography, Box, Button } from '@mui/joy'
import React, { useState } from 'react'

const CancelRequest = ({ open, onClose, item, api }) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e, id) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        try {
            setLoading(true)
            const foundResponse = await fetch(`/api/${api}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'Canceled',
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
    <Modal open={open === item._id} onClose={onClose}>
        <ModalDialog>
            <ModalClose />
            <Typography level="h4" gutterBottom>Cancel Request</Typography>
            <Typography>Are you sure you want to cancel your request?</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button disabled={loading} loading={loading} onClick={onClose} variant="outlined" fullWidth>Close</Button>
                <Button disabled={loading} loading={loading} onClick={(e) => handleSubmit(e, item._id)} fullWidth color="danger">Cancel</Button>
            </Box>
        </ModalDialog>
    </Modal>
  )
}

export default CancelRequest