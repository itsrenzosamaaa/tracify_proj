'use client';

import { Snackbar, Button, Modal, ModalClose, ModalDialog, Typography, Box, DialogContent } from '@mui/joy';
import React from 'react';
import MatchedItemsDetails from './MatchedItemsDetails';

const CompletedModal = ({ row, open, onClose }) => {
    return (
        <>
            <Modal open={open === row._id} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Matched Item Details
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
                        <MatchedItemsDetails row={row} />
                    </DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="outlined" onClick={onClose} fullWidth>
                            Back
                        </Button>
                    </Box>
                </ModalDialog>
            </Modal>
        </>
    );
};

export default CompletedModal;
