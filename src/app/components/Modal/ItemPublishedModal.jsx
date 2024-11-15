'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, DialogContent, } from '@mui/joy';
import React from 'react';
import ItemDetails from './ItemDetails';

const ItemPublishedModal = ({ row, open, onClose }) => {
    return (
        <Modal open={open === row._id} onClose={onClose}>
            <ModalDialog>
                <ModalClose />
                <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Published Item Details
                </Typography>
                <DialogContent sx={{ overflowX: 'hidden' }}>
                    <ItemDetails row={row} />
                </DialogContent>
                <Button variant="outlined" onClick={onClose}>Close</Button>
            </ModalDialog>
        </Modal>
    );
};

export default ItemPublishedModal;
