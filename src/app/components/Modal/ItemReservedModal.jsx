'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, DialogContent } from '@mui/joy';
import React, { useState } from 'react';
import ItemDetails from './ItemDetails';

const ItemReservedModal = ({ row, open, onClose, refreshData }) => {
    const [confirmationItemClaimed, setConfirmationItemClaimed] = useState(false);
    const [confirmationItemDecline, setConfirmationItemDecline] = useState(false);
    const [loading, setLoading] = useState(false);

    console.log(row)

    const handleSubmit = async (e, foundItemId, lostItemId, matchedId) => {
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
                    status: 'Resolved',
                }),
            });

            console.log(foundResponse)

            // Check response status and parse JSON
            if (!foundResponse.ok) {
                const errorData = await foundResponse.json();
                throw new Error(errorData.message || 'Failed to update found item status');
            }

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

            const matchResponse = await fetch(`/api/match-items/${matchedId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any auth headers if needed
                },
                body: JSON.stringify({
                    status: 'Claimed',
                }),
            });

            if (!matchResponse.ok) {
                const errorData = await matchResponse.json();
                throw new Error(errorData.message || 'Failed to update lost item status');
            }

            if (foundResponse.ok && lostResponse.ok && matchResponse.ok) {
                const canRate = [
                    {
                        sender: row.finder.user._id,
                        receiver: row.owner.user._id,
                        item: row.finder.item._id,
                        quantity: null,
                        feedback: null,
                        compliments: null,
                        done_review: false,
                        date_created: null,
                        date_edited: null,
                    },
                    {
                        sender: row.owner.user._id,
                        receiver: row.finder.user._id,
                        item: row.owner.item._id,
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

    const handleDecline = async (e, foundItemId, lostItemId, matchedItemId) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        try {
            setLoading(true);

            const foundResponse = await fetch(`/api/found-items/${foundItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any auth headers if needed
                },
                body: JSON.stringify({
                    status: 'Decline Retrieval',
                }),
            });

            // Check response status and parse JSON
            if (!foundResponse.ok) {
                const errorData = await foundResponse.json();
                throw new Error(errorData.message || 'Failed to update found item status');
            }

            const lostResponse = await fetch(`/api/lost-items/${lostItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any auth headers if needed
                },
                body: JSON.stringify({
                    status: 'Decline Retrieval',
                }),
            });

            // Check response status and parse JSON
            if (!lostResponse.ok) {
                const errorData = await lostResponse.json();
                throw new Error(errorData.message || 'Failed to update found item status');
            }

            const matchResponse = await fetch(`/api/match-items/${matchedItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any auth headers if needed
                },
                body: JSON.stringify({
                    status: 'Decline',
                }),
            });

            if (!matchResponse.ok) {
                const errorData = await matchResponse.json();
                throw new Error(errorData.message || 'Failed to update lost item status');
            }

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
                    Reserved Item Details
                </Typography>
                <DialogContent>
                    <ItemDetails row={row} />
                </DialogContent>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button color="danger" onClick={() => setConfirmationItemDecline(true)} fullWidth>
                        Decline
                    </Button>
                    <Modal open={confirmationItemDecline} onClose={() => setConfirmationItemDecline(false)}>
                        <ModalDialog>
                            <ModalClose />
                            <Typography level="h4" gutterBottom>
                                Decline
                            </Typography>
                            <Typography>
                                Are you sure you want to decline the retrieval?
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button
                                    disabled={loading}
                                    color="danger"
                                    onClick={() => setConfirmationItemDecline(false)}
                                    fullWidth
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={loading}
                                    loading={loading}
                                    onClick={(e) => handleDecline(e, row.finder.item._id, row.owner.item._id, row._id)}
                                    fullWidth
                                >
                                    Confirm
                                </Button>
                            </Box>
                        </ModalDialog>
                    </Modal>
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
                                    onClick={(e) => handleSubmit(e, row.finder.item._id, row.owner.item._id, row._id)}
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
