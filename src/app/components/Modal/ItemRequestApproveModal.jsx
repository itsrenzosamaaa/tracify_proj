'use client';

import { Snackbar, Button, Modal, ModalClose, ModalDialog, Typography, Box, Radio, RadioGroup, Stack, DialogContent } from '@mui/joy';
import { FormControlLabel } from '@mui/material';
import React, { useState } from 'react';
import ItemDetails from './ItemDetails';

const ItemRequestApproveModal = ({ row, open, onClose, refreshData, session }) => {
    const [confirmationApproveModal, setConfirmationApproveModal] = useState(null);
    const [confirmationDeclineModal, setConfirmationDeclineModal] = useState(null);
    const [reasonModal, setReasonModal] = useState(null);
    const [declineReason, setDeclineReason] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(null);
    const [loading, setLoading] = useState(false);

    console.log(row)

    const handleReasonChange = (event) => {
        setDeclineReason(event.target.value);
    };

    const handleSubmit = async (e, id) => {
        e?.preventDefault();
        setLoading(true)
        const apiEndpoint = row?.item?.isFoundItem ? `/api/found-items/${id}` : `/api/lost-items/${id}`;
        try {
            const response = await fetch(apiEndpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: row?.item?.isFoundItem ? "Surrender Pending" : "Missing",
                    monitoredBy: row?.item?.isFoundItem ? session?.user?.id : null,
                }),
            });

            if (!response.ok) throw new Error(data.message || 'Failed to update status');

            setOpenSnackbar('success');  // Ensure this is reached on success
            onClose();
            setConfirmationApproveModal(null);
            refreshData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }
    };

    const handleDecline = async (e, id) => {
        e?.preventDefault();
        setLoading(true)
        const apiEndpoint = row?.item?.isFoundItem ? `/api/found-items/${id}` : `/api/lost-items/${id}`;
        try {
            const response = await fetch(apiEndpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'Declined',
                    reason: declineReason,
                }),
            });

            if (!response.ok) throw new Error(data.message || 'Failed to update status');

            onClose();
            setConfirmationDeclineModal(null);
            setReasonModal(null);
            setDeclineReason('');
            await refreshData();
            setOpenSnackbar('failed');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }
    };


    return (
        <>
            <Modal open={open === row._id} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Approve Item Request
                    </Typography>
                    <DialogContent sx={{ overflowX: 'hidden' }}>
                        <ItemDetails row={row} />
                    </DialogContent>
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
                                        <FormControlLabel value="Item Not Eligible for Posting" control={<Radio />} label="Item Not Eligible for Posting" />
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
                                <Typography>{row.item?.isFoundItem ? 'Proceed with surrendering the item?' : 'Would you like to mark this item as missing?'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button loading={loading} disabled={loading} color="danger" onClick={() => setConfirmationApproveModal(null)} fullWidth>Cancel</Button>
                                    <Button loading={loading} disabled={loading} onClick={(e) => handleSubmit(e, row.item._id)} fullWidth>Confirm</Button>
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
                                    <Button onClick={(e) => handleDecline(e, row.item._id)} fullWidth>Decline</Button>
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
                    setOpenSnackbar(false);
                }}
            >
                Item Request {openSnackbar === 'success' ? 'Approved' : 'Declined'}!
            </Snackbar>
        </>
    );
};

export default ItemRequestApproveModal;
