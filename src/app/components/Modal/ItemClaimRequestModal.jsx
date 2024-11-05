'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, DialogContent } from '@mui/joy';
import React, { useState } from 'react';
import ItemDetails from './ItemDetails';

const ItemClaimRequestModal = ({ row, open, onClose, refreshData }) => {
    const [confirmationApproveModal, setConfirmationApproveModal] = useState(null);
    const [confirmationDeclineModal, setConfirmationDeclineModal] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e, foundItemId, lostItemId) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        try {
            setLoading(true);
            
            // First API call
            const foundResponse = await fetch(`/api/found-items/${foundItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any auth headers if needed
                },
                body: JSON.stringify({ 
                    status: 'Reserved',
                }),
            });

            // Check response status and parse JSON
            if (!foundResponse.ok) {
                const errorData = await foundResponse.json();
                throw new Error(errorData.message || 'Failed to update found item status');
            }
            
            const foundData = await foundResponse.json();
            console.log('Found item update response:', foundData);

            // Second API call
            const lostResponse = await fetch(`/api/lost-items/${lostItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any auth headers if needed
                },
                body: JSON.stringify({ 
                    status: 'Tracked',
                }),
            });

            if (!lostResponse.ok) {
                const errorData = await lostResponse.json();
                throw new Error(errorData.message || 'Failed to update lost item status');
            }

            const lostData = await lostResponse.json();
            console.log('Lost item update response:', lostData);

            // Close modals and refresh data
            setConfirmationApproveModal(null);
            onClose();
            refreshData(); // Renamed from fetch to be more descriptive

        } catch (error) {
            console.error('Error updating items:', error);
            // You might want to show an error message to the user here
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open === row._id} onClose={onClose}>
            <ModalDialog>
                <ModalClose />
                <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Approve Claim Request
                </Typography>
                <DialogContent>
                    <ItemDetails row={row} />
                </DialogContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={() => setConfirmationDeclineModal(row._id)} fullWidth color="danger">
                        Decline
                    </Button>
                    <Button onClick={() => setConfirmationApproveModal(row._id)} fullWidth>
                        Approve
                    </Button>
                    <Modal open={confirmationApproveModal} onClose={() => setConfirmationApproveModal(null)}>
                        <ModalDialog>
                            <ModalClose />
                            <Typography level="h4" gutterBottom>
                                Confirmation
                            </Typography>
                            <Typography>
                                Reserve this item to the potential owner?
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button 
                                    disabled={loading} 
                                    color="danger" 
                                    onClick={() => setConfirmationApproveModal(null)} 
                                    fullWidth
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    disabled={loading} 
                                    loading={loading} 
                                    onClick={(e) => handleSubmit(e, row._id, row.matched._id)} 
                                    fullWidth
                                >
                                    Confirm
                                </Button>
                            </Box>
                        </ModalDialog>
                    </Modal>
                </Box>
            </ModalDialog>
        </Modal>
    );
};

export default ItemClaimRequestModal;