'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, DialogContent } from '@mui/joy';
import React, { useState } from 'react';
import ItemDetails from './ItemDetails';

const ItemReservedModal = ({ row, open, onClose, refreshData }) => {
    const [confirmationItemClaimed, setConfirmationItemClaimed] = useState(false);
    const [loading, setLoading] = useState(false);

    console.log(row)

    const handleSubmit = async (e, foundItemId, lostItemId) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        console.log(foundItemId)
        console.log(lostItemId)

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
                    status: 'Resolved',
                }),
            });

            console.log(foundResponse)

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
                    status: 'Claimed',
                }),
            });

            if (!lostResponse.ok) {
                const errorData = await lostResponse.json();
                throw new Error(errorData.message || 'Failed to update lost item status');
            }

            const lostData = await lostResponse.json();
            console.log('Lost item update response:', lostData);

            if (foundResponse.ok && lostResponse.ok){
                const canRate = [
                    {
                        sender: row.finder._id,
                        receiver: row.matched.owner._id,
                        item: row._id,
                        quantity: null,
                        feedback: null,
                        compliments: null,
                        done_review: false,
                        date_created: null,
                        date_edited: null,
                    },
                    {
                        sender: row.matched.owner._id,
                        receiver: row.finder._id,
                        item: row._id,
                        quantity: null,
                        feedback: null,
                        compliments: null,
                        done_review: false,
                        date_created: null,
                        date_edited: null,
                    }
                ];

                for (const addRate of canRate) {
                    try {
                        const response = await fetch('/api/ratings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(addRate),
                        });
    
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to create rating');
                        }
                        // Close modals and refresh data
                        setConfirmationItemClaimed(null);
                        onClose();
                        refreshData(); // Renamed from fetch to be more descriptive
                    } catch (error) {
                        console.error('Error creating rating:', error);
                        // Handle rating creation error if needed
                    }
                }
            }
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
                    Reserved Item Details
                </Typography>
                <DialogContent>
                    <ItemDetails row={row} />
                </DialogContent>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button color="success" onClick={() => setConfirmationItemClaimed(true)} fullWidth>
                        Item Resolved
                    </Button>
                    <Modal open={confirmationItemClaimed} onClose={() => setConfirmationItemClaimed(false)}>
                        <ModalDialog>
                            <ModalClose />
                            <Typography level="h4" gutterBottom>
                                Confirmation
                            </Typography>
                            <Typography>
                                Did the owner retrieve the item?
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button
                                    disabled={loading}
                                    color="danger"
                                    onClick={() => setConfirmationItemClaimed(false)}
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

export default ItemReservedModal;
