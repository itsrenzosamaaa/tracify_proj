'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, } from '@mui/joy';
import React, { useState } from 'react';
import ItemDetails from './ItemDetails';

const ItemRequestApproveModal = ({ row, open, onClose, fetch }) => {
    const [confirmationApproveModal, setConfirmationApproveModal] = useState(null);
    const [confirmationDeclineModal, setConfirmationDeclineModal] = useState(null);

    const handleSubmit = async (e, id) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }  

        try {
            const response = await fetch(`/api/found-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'Validating',
                    monitoredBy: session?.user?.id,
                }),
            });
    
            if (!response.ok) throw new Error('Failed to update status');

            onClose();
            fetch();
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Modal open={open === row._id} onClose={onClose}>
            <ModalDialog>
                <ModalClose />
                <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Approve Item Request
                </Typography>
                <ItemDetails row={row} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={() => setConfirmationDeclineModal(row._id)} fullWidth color="danger">Decline</Button>
                    <Button onClick={() => setConfirmationApproveModal(row._id)} fullWidth>Approve</Button>
                    <Modal open={confirmationApproveModal} onClose={() => setConfirmationApproveModal(null)}>
                        <ModalDialog>
                            <ModalClose />
                            <Typography level="h4" gutterbottom>Confirmation</Typography>
                            <Typography>Move to Validating?</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button color="danger" onClick={() => setConfirmationApproveModal(null)} fullWidth>Cancel</Button>
                                <Button onClick={(e) => handleSubmit(e, row._id)} fullWidth>Confirm</Button>
                            </Box>
                        </ModalDialog>
                    </Modal>
                </Box>
            </ModalDialog>
        </Modal>
    );
};

export default ItemRequestApproveModal;
