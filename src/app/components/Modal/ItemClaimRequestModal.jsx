'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, DialogContent, Snackbar, RadioGroup, Radio, Stack } from '@mui/joy';
import React, { useState } from 'react';
import { FormControlLabel } from '@mui/material';
import MatchedItemsDetails from './MatchedItemsDetails';

const ItemClaimRequestModal = ({ row, open, onClose, refreshData }) => {
    const [confirmationApproveModal, setConfirmationApproveModal] = useState(null);
    const [confirmationDeclineModal, setConfirmationDeclineModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(null);

    const handleSubmit = async (e, lostItemId, matchedItemId) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        try {
            setLoading(true);

            const makeRequest = async (url, method, body) => {
                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: body ? JSON.stringify(body) : null,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to perform request to ${url}`);
                }

                return response.json();
            };

            await makeRequest(`/api/lost-items/${lostItemId}`, 'PUT', { status: 'Unclaimed' });
            await makeRequest(`/api/match-items/${matchedItemId}`, 'PUT', { request_status: 'Approved' });

            const notificationData = [
                {
                    receiver: row.finder.user._id,
                    message: `Your found item ${row.finder.item.name} has been matched to its owner!`,
                    type: 'Found Items',
                    markAsRead: false,
                    dateNotified: new Date(),
                },
                {
                    receiver: row.owner.user._id,
                    message: `Your claim request of ${row.finder.item.name} has been approved. Please come to ${row.finder.item.monitoredBy.role.name} office for claiming an item.`,
                    type: 'Lost Items',
                    markAsRead: false,
                    dateNotified: new Date(),
                },
            ];

            await Promise.all(
                notificationData.map((notif) => makeRequest('/api/notification', 'POST', notif))
            );

            // Close modals and refresh data
            setConfirmationApproveModal(null);
            onClose();
            refreshData(); // Renamed from fetch to be more descriptive
            setOpenSnackbar('success');
        } catch (error) {
            console.error('Error updating items:', error);
            // You might want to show an error message to the user here
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async (e, foundItemId, matchedItemId) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        try {
            setLoading(true);

            const makeRequest = async (url, method, body) => {
                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: body ? JSON.stringify(body) : null,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to perform request to ${url}`);
                }

                return response.json();
            };

            await makeRequest(`/api/found-items/${foundItemId}`, 'PUT', { status: 'Decline Retrieval' });
            await makeRequest(`/api/match-items/${matchedItemId}`, 'PUT', {
                request_status: 'Declined',
                remarks: 'Item details are not matched.',
            });
            await makeRequest('/api/notification', 'POST', {
                receiver: row.owner.user._id,
                message: `Your claim request of ${row.finder.item.name} has been declined due to unmatched details.`,
                type: 'Lost Items',
                markAsRead: false,
                dateNotified: new Date(),
            })

            // Close modals and refresh data
            setConfirmationApproveModal(null);
            onClose();
            refreshData(); // Renamed from fetch to be more descriptive
            setOpenSnackbar('failed');
        } catch (error) {
            console.error('Error updating items:', error);
            // You might want to show an error message to the user here
        } finally {
            setLoading(false);
        }
    };

    console.log(row)

    return (
        <>
            <Modal open={open === row._id} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Approve Claim Request
                    </Typography>
                    <DialogContent sx={{ overflowX: 'hidden' }}>
                        <MatchedItemsDetails row={row} />
                    </DialogContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={() => setConfirmationDeclineModal(row._id)} fullWidth color="danger">
                            Decline
                        </Button>
                        <Modal open={confirmationDeclineModal} onClose={() => setConfirmationDeclineModal(null)}>
                            <ModalDialog>
                                <ModalClose />
                                <Typography level="h4" gutterBottom>
                                    Decline Retrieval Request
                                </Typography>
                                <Typography>
                                    Are you sure you want to decline the retrieval request?
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button
                                        disabled={loading}
                                        color="danger"
                                        onClick={() => setConfirmationDeclineModal(null)}
                                        fullWidth
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={loading}
                                        loading={loading}
                                        onClick={(e) => handleDecline(e, row?.finder?.item?._id, row._id)}
                                        fullWidth
                                    >
                                        Confirm
                                    </Button>
                                </Box>
                            </ModalDialog>
                        </Modal>
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
                                        onClick={(e) => handleSubmit(e, row?.owner?.item?._id, row._id)}
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
            <Snackbar
                autoHideDuration={5000}
                open={openSnackbar}
                variant="solid"
                color="success"
                onClose={(event, reason) => {
                    if (reason === 'clickaway') {
                        return;
                    }
                    setOpenSnackbar(null);
                }}
            >
                The retrieval request has been {openSnackbar === 'success' ? 'approved!' : 'declined.'}
            </Snackbar>
        </>
    );
};

export default ItemClaimRequestModal;