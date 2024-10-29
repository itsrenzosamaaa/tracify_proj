import { Modal, ModalClose, ModalDialog, Typography, Box, Button } from '@mui/joy'
import React from 'react'

const ConfirmationRetrievalRequest = ({ open, onClose, item }) => {
    const handleSubmit = async (e, id) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        // try {
        //     const response = await fetch(`/api/found-items/${id}`, {
        //         method: 'PUT',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ 
        //             status: 'Claim Request',
        //             matched: session?.user?.id,
        //         }),
        //     });
    
        //     if (!response.ok) throw new Error('Failed to update status');

        //     onClose();
        //     fetch();
        // } catch (error) {
        //     console.error(error)
        // }
    }
  return (
    <Modal open={open} onClose={onClose}>
        <ModalDialog>
            <ModalClose />
            <Typography level="h4" gutterBottom>Confirmation</Typography>
            <Typography>Send a retrieval request to {item.monitoredBy.role.name}?</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={(e) => handleSubmit(e, item._id)} fullWidth>Send</Button>
                <Button onClick={onClose} fullWidth color="danger">Abort</Button>
            </Box>
        </ModalDialog>
    </Modal>
  )
}

export default ConfirmationRetrievalRequest