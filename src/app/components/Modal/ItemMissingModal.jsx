'use client';

import { Button, DialogContent, Modal, ModalClose, ModalDialog, Typography } from '@mui/joy';
import React from 'react';
import ItemDetails from './ItemDetails';

const ItemMissingModal = ({ row, open, onClose, refreshData, snackBar }) => {
    return (
        <Modal open={open === row._id} onClose={onClose}>
            <ModalDialog>
                <ModalClose />
                <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Missing Item Details
                </Typography>
                <DialogContent>
                    <ItemDetails row={row} refreshData={refreshData} snackBar={snackBar} />
                </DialogContent>
                <Button variant="outlined" onClick={onClose}>Close</Button>
            </ModalDialog>
        </Modal>
    );
};

export default ItemMissingModal;
