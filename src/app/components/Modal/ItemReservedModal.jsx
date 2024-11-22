'use client';

import { Snackbar, Button, Modal, ModalClose, ModalDialog, Typography, Box, DialogContent, Input, RadioGroup, Stack, Radio } from '@mui/joy';
import React, { useState } from 'react';
import { FormControlLabel } from '@mui/material';
import MatchedItemsDetails from './MatchedItemsDetails';

const ItemReservedModal = ({ row, open, onClose, refreshData }) => {
    const [declineModal, setDeclineModal] = useState(false);
    const [declineRemarks, setDeclineRemarks] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [confirmationItemClaimed, setConfirmationItemClaimed] = useState(false);
    const [confirmationItemDecline, setConfirmationItemDecline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(null);

    const handleReasonChange = (event) => {
        setDeclineRemarks(event.target.value);

        if (event.target.value !== 'Other') {
            setOtherReason('');
        }
    };

    console.log(row)

    const handleSubmit = async (e, foundItemId, lostItemId, matchedId) => {
        if (e?.preventDefault) {
            e.preventDefault();
        }

        try {
            setLoading(true);

            // Helper function for fetch requests
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

            // Update found item status
            await makeRequest(`/api/found-items/${foundItemId}`, 'PUT', { status: 'Resolved' });

            // Update lost item status
            await makeRequest(`/api/lost-items/${lostItemId}`, 'PUT', { status: 'Claimed' });

            // Award badges if conditions are met
            const badgeData = await makeRequest('/api/badge/found-item', 'GET');
            const finderData = await makeRequest(`/api/finder/${row.finder.user._id}`, 'GET');
            const resolvedItemsCount = finderData.filter((finder) => finder.item.status === 'Resolved').length;

            for (const badge of badgeData) {
                if (resolvedItemsCount >= badge.meetConditions) {
                    await makeRequest(`/api/award-badge/user/${row.finder.user._id}`, 'PUT', { badgeId: badge._id });
                }
            }

            // Update match status
            await makeRequest(`/api/match-items/${matchedId}`, 'PUT', { request_status: 'Completed' });

            // Add rating records
            const ratingData = [
                {
                    sender: row.finder.user._id,
                    receiver: row.owner.user._id,
                    item: row.finder.item._id,
                    done_review: false,
                },
                {
                    sender: row.owner.user._id,
                    receiver: row.finder.user._id,
                    item: row.owner.item._id,
                    done_review: false,
                },
            ];

            await Promise.all(
                ratingData.map((rate) => makeRequest('/api/ratings', 'POST', rate))
            );

            // Close modals, refresh data, and show success notification
            setConfirmationItemClaimed(null);
            onClose();
            await refreshData();
            setOpenSnackbar('success');
        } catch (error) {
            console.error('Error updating items:', error);
            setOpenSnackbar('error'); // Display error message
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
                    request_status: 'Declined',
                    remarks: declineRemarks === 'Other' ? otherReason : declineRemarks,
                }),
            });

            if (!matchResponse.ok) {
                const errorData = await matchResponse.json();
                throw new Error(errorData.message || 'Failed to update lost item status');
            }

            // Close modals and refresh data
            setConfirmationApproveModal(false);
            setDeclineModal(false);
            onClose();
            await refreshData(); // Renamed from fetch to be more descriptive
            setOpenSnackbar('failed');
        } catch (error) {
            console.error('Error updating items:', error);
            // You might want to show an error message to the user here
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal open={open === row._id} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Reserved Item Details
                    </Typography>
                    <DialogContent sx={{ overflowX: 'hidden' }}>
                        <MatchedItemsDetails row={row} />
                    </DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button color="danger" onClick={() => setDeclineModal(true)} fullWidth>
                            Decline
                        </Button>
                        <Modal open={declineModal} onClose={() => setDeclineModal(false)}>
                            <ModalDialog>
                                <ModalClose />
                                <Typography level="h4" gutterbottom>Remarks</Typography>
                                <Typography>Select Remarks for Claim Decline</Typography>
                                <RadioGroup
                                    value={declineRemarks}
                                    onChange={handleReasonChange}
                                    sx={{ my: 2 }}
                                >
                                    <Stack spacing={2}>
                                        <FormControlLabel value="Ownership Verification Failed" control={<Radio />} label="Ownership Verification Failed" />
                                        <FormControlLabel value="No Show at Office" control={<Radio />} label="No Show at Office" />
                                        <FormControlLabel value="Unauthorized Claim Attempt" control={<Radio />} label="Unauthorized Claim Attempt" />
                                        <FormControlLabel value="Other" control={<Radio />} label="Other" />
                                    </Stack>
                                </RadioGroup>

                                {declineRemarks === 'Other' && (
                                    <Input
                                        placeholder='Please specify your reason...'
                                        fullWidth
                                        value={otherReason}
                                        onChange={(e) => setOtherReason(e.target.value)}
                                    />
                                )}

                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button color="danger" onClick={() => setDeclineModal(false)} fullWidth>Cancel</Button>
                                    <Button
                                        onClick={() => setConfirmationItemDecline(true)}
                                        fullWidth
                                        disabled={!declineRemarks || (declineRemarks === 'Other' && otherReason === '')}  // Disable confirm button if no reason is selected
                                    >
                                        Submit
                                    </Button>
                                </Box>
                            </ModalDialog>
                        </Modal>
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
                The item has been {openSnackbar === 'success' ? 'resolved!' : 'declined.'}
            </Snackbar>
        </>
    );
};

export default ItemReservedModal;
