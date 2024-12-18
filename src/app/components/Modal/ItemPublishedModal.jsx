'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, DialogContent, } from '@mui/joy';
import React from 'react';
import ItemDetails from './ItemDetails';

const ItemPublishedModal = ({ row, open, onClose, refreshData, session, setMessage, setOpenSnackbar }) => {
    return (
        <Modal open={open === row._id} onClose={onClose}>
            <ModalDialog>
                <ModalClose />
                <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {row?.item?.status} Item Details
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
                    <ItemDetails row={row} refreshData={refreshData} setOpenSnackbar={setOpenSnackbar} setMessage={setMessage} />
                </DialogContent>
                <Button variant="outlined" onClick={onClose}>Close</Button>
            </ModalDialog>
        </Modal>
    );
};

export default ItemPublishedModal;
