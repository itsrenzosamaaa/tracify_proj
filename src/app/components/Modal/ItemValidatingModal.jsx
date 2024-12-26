'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, Snackbar, DialogContent } from '@mui/joy';
import React, { useState } from 'react';
import ItemDetails from './ItemDetails';

const ItemValidatingModal = ({ row, open, onClose, refreshData, session, setMessage, setOpenSnackbar }) => {
    const [itemValidate, setItemValidate] = useState(null);
    const [itemInvalidate, setItemInvalidate] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e, id) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        setLoading(true)

        try {
            const response = await fetch(`/api/found-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Published' }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            const notificationResponse = await fetch('/api/notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiver: row.user._id,
                    message: `The item (${row.item.name}) you surrendered has been published!`,
                    type: 'Found Items',
                    markAsRead: false,
                    dateNotified: new Date(),
                }),
            });

            if (!notificationResponse.ok) throw new Error(data.message || 'Failed to send notification');

            const mailResponse = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'ItemSurrenderSuccess',
                    to: row.user.emailAddress,
                    subject: 'Item Surrender Success',
                    name: row.user.firstname,
                    link: 'tracify-project.vercel.app/my-items#found-item',
                    itemName: row.item.name,
                    location: session.user.roleName,
                }),
            });

            if (!mailResponse.ok) throw new Error(data.message || 'Failed to send email');

            setOpenSnackbar('success');
            setMessage('Item has been published!')
            onClose();
            await refreshData();
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleInvalid = async (e, id) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        setLoading(true)

        try {
            const response = await fetch(`/api/found-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Declined', reason: "The finder failed to surrender the item." }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            const notificationResponse = await fetch('/api/notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiver: row.user._id,
                    message: `You failed to surrender the item (${row.item.name})`,
                    type: 'Declined Items',
                    markAsRead: false,
                    dateNotified: new Date(),
                }),
            });

            if (!notificationResponse.ok) throw new Error(data.message || 'Failed to send notification');

            const mailResponse = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'ItemSurrenderInvalid',
                    to: row.user.emailAddress,
                    subject: 'You failed to surrender the item',
                    name: row.user.firstname,
                    link: 'tracify-project.vercel.app/my-items#declined-item',
                    itemName: row.item.name,
                    location: session.user.roleName,
                }),
            });

            if (!mailResponse.ok) throw new Error(data.message || 'Failed to send email');

            setOpenSnackbar('success');
            setMessage('Item has been invalidated.')
            onClose();
            await refreshData();
        } catch (error) {
            setOpenSnackbar('success');
            setMessage(error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Modal open={open === row._id} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Surrender Pending
                    </Typography>
                    <DialogContent
                        sx={{
                            overflowX: 'hidden',
                            overflowY: 'auto', // Allows vertical scrolling
                            '&::-webkit-scrollbar': { display: 'none' }, // Hides scrollbar in WebKit-based browsers (Chrome, Edge, Safari)
                            '-ms-overflow-style': 'none', // Hides scrollbar in IE and Edge
                            'scrollbar-width': 'none', // Hides scrollbar in Firefox
                        }}
                    >
                        <ItemDetails row={row} />
                    </DialogContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button color="danger" onClick={() => setItemInvalidate(row.item._id)} fullWidth>Invalid</Button>
                        <Button onClick={() => setItemValidate(row.item._id)} fullWidth>Publish</Button>
                        <Modal open={itemValidate} onClose={() => setItemValidate(null)}>
                            <ModalDialog>
                                <ModalClose />
                                <Typography level="h4" gutterbottom>Confirmation</Typography>
                                <Typography>Are you you want to publish the item?</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button loading={loading} disabled={loading} color="danger" onClick={() => setItemValidate(null)} fullWidth>Cancel</Button>
                                    <Button loading={loading} disabled={loading} onClick={(e) => handleSubmit(e, row.item._id)} fullWidth>Confirm</Button>
                                </Box>
                            </ModalDialog>
                        </Modal>
                        <Modal open={itemInvalidate} onClose={() => setItemInvalidate(null)}>
                            <ModalDialog>
                                <ModalClose />
                                <Typography level="h4" gutterbottom>Invalidation</Typography>
                                <Typography>Did the finder failed to surrender the item?</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button loading={loading} disabled={loading} variant="outlined" onClick={() => setItemInvalidate(null)} fullWidth>Cancel</Button>
                                    <Button loading={loading} disabled={loading} color="danger" onClick={(e) => handleInvalid(e, row.item._id)} fullWidth>Confirm</Button>
                                </Box>
                            </ModalDialog>
                        </Modal>
                    </Box>
                </ModalDialog>
            </Modal>
        </>
    );
};

export default ItemValidatingModal;
