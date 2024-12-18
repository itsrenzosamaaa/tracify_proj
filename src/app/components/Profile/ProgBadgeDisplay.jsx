'use client'

import React, { useState } from "react";
import { Paper } from '@mui/material';
import { Box, Modal, Typography, Sheet, ModalClose } from '@mui/joy';
import Image from "next/image";

const trophyImages = {
    blank: '/trophy/blank_trophy.png',
    bronze: '/trophy/bronze_trophy.png',
    silver: '/trophy/silver_trophy.png',
    gold: '/trophy/gold_trophy.png',
    platinum: '/trophy/platinum_trophy.png',
    diamond: '/trophy/diamond_trophy.png',
};

const ProgBadgeDisplay = ({ user, items, sentRatings }) => {
    const [open, setOpen] = useState(false);

    const filteredResolvedItems = items.filter(item => item.status === 'Resolved');
    console.log(filteredResolvedItems)

    const multiplierSFI = filteredResolvedItems.length * 500;
    const multiplierRateToUser = sentRatings * 250;
    const multiplier = multiplierSFI + multiplierRateToUser;

    let trophy = trophyImages.blank;
    let endPoints = ' / 500';

    if (multiplier >= 500 && multiplier <= 2499) {
        trophy = trophyImages.bronze;
        endPoints = ' / 2500';
    } else if (multiplier >= 2500 && multiplier <= 4999) {
        trophy = trophyImages.silver;
        endPoints = ' / 5000';
    } else if (multiplier >= 5000 && multiplier <= 9999) {
        trophy = trophyImages.gold;
        endPoints = ' / 10000';
    } else if (multiplier >= 10000 && multiplier <= 19999) {
        trophy = trophyImages.platinum;
        endPoints = ' / 20000';
    } else if (multiplier >= 20000) {
        trophy = trophyImages.diamond;
        endPoints = ' points';
    }

    return (
        <>
            <Box sx={{ padding: '1rem 1rem 1rem 0' }}>
                <Typography level="body-lg" fontWeight='500'>Trophy</Typography>
            </Box>
            <Paper elevation={2} sx={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: 'center',
                justifyContent: 'space-around',
                minHeight: '8.75rem',
                maxHeight: '8.75rem',
            }}>
                <Image src={trophy} alt='Trophy' width='76' height='76' onClick={() => setOpen(true)} priority />
                <Modal
                    aria-labelledby="modal-title"
                    aria-describedby="modal-desc"
                    open={open}
                    onClose={() => setOpen(false)}
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    <Sheet
                        variant="outlined"
                        sx={{ maxWidth: 500, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
                    >
                        <ModalClose variant="plain" sx={{ m: 1 }} />
                        <Typography
                            component="h2"
                            id="modal-title"
                            level="h4"
                            textColor="inherit"
                            sx={{ fontWeight: 'lg', mb: 1 }}
                        >
                            Points Overview
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '20rem' }}>
                            <Box>
                                <Typography level="body-md" fontWeight="700">Successful Found Items:</Typography>
                                <Typography level="body-md" fontWeight="700">Successful Ratings:</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography level="body-md" color='primary-main'>{filteredResolvedItems.length}</Typography>
                                <Typography level="body-md" color='primary-main'>2</Typography>
                            </Box>
                        </Box>
                    </Sheet>
                </Modal>
                <Typography>{multiplier}{endPoints}</Typography>
            </Paper>
        </>
    )
}

export default ProgBadgeDisplay