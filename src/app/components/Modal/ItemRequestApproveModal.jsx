'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, Radio, RadioGroup, Stack } from '@mui/joy';
import { FormControlLabel } from '@mui/material';
import React, { useState } from 'react';
import ItemDetails from './ItemDetails';

const ItemRequestApproveModal = ({ row, open, onClose, refreshData }) => {
    const [confirmationApproveModal, setConfirmationApproveModal] = useState(null);
    const [confirmationDeclineModal, setConfirmationDeclineModal] = useState(null);
    const [reasonModal, setReasonModal] = useState(null);
    const [declineReason, setDeclineReason] = useState('');

    const handleReasonChange = (event) => {
        setDeclineReason(event.target.value);
    };

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
            setConfirmationApproveModal(null);
            refreshData();
        } catch (error) {
            console.error(error)
        }
    }

    const handleDecline = async (e, id) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        try {
            const response = await fetch(`/api/found-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'Invalid',
                    reason: declineReason,
                }),
            });
    
            if (!response.ok) throw new Error('Failed to update status');

            onClose();
            setConfirmationDeclineModal(null);
            setReasonModal(null);
            setDeclineReason('');
            refreshData();
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
                    <Button onClick={() => setReasonModal(row._id)} fullWidth color="danger">Decline</Button>
                    <Button onClick={() => setConfirmationApproveModal(row._id)} fullWidth>Approve</Button>
                    <Modal open={reasonModal} onClose={() => setReasonModal(null)}>
                        <ModalDialog>
                            <ModalClose />
                            <Typography level="h4" gutterbottom>Decline</Typography>
                            <Typography>Reason to Decline</Typography>
                            <RadioGroup
                                value={declineReason}
                                onChange={handleReasonChange}
                                sx={{ my: 2 }}
                            >
                                <Stack spacing={2}>
                                    <FormControlLabel value="Invalid Information" control={<Radio />} label="Invalid Information" />
                                    <FormControlLabel value="Item Is Not Tangible" control={<Radio />} label="Item Is Not Tangible" />
                                    <FormControlLabel value="Incomplete Information" control={<Radio />} label="Incomplete Information" />
                                    <FormControlLabel value="Item Not Eligible for Posting" control={<Radio />} label="Item Not Eligible for Posting" />
                                    <FormControlLabel value="Duplicate Submission" control={<Radio />} label="Duplicate Submission" />
                                    <FormControlLabel value="Incorrect Category" control={<Radio />} label="Incorrect Category" />
                                    <FormControlLabel value="Item Already Found" control={<Radio />} label="Item Already Found" />
                                    <FormControlLabel value="Other" control={<Radio />} label="Other" />
                                </Stack>
                            </RadioGroup>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button color="danger" onClick={() => setReasonModal(null)} fullWidth>Cancel</Button>
                                <Button 
                                    onClick={() => setConfirmationDeclineModal(row._id)} 
                                    fullWidth
                                    disabled={!declineReason}  // Disable confirm button if no reason is selected
                                >
                                    Submit
                                </Button>
                            </Box>
                        </ModalDialog>
                    </Modal>
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
                    <Modal open={confirmationDeclineModal} onClose={() => setConfirmationDeclineModal(null)}>
                        <ModalDialog>
                            <ModalClose />
                            <Typography level="h4" gutterbottom>Confirmation</Typography>
                            <Typography>Are you sure you want to decline item request?</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button color="danger" onClick={() => setConfirmationDeclineModal(null)} fullWidth>Abort</Button>
                                <Button onClick={(e) => handleDecline(e, row._id)} fullWidth>Decline</Button>
                            </Box>
                        </ModalDialog>
                    </Modal>
                </Box>
            </ModalDialog>
        </Modal>
    );
};

export default ItemRequestApproveModal;
