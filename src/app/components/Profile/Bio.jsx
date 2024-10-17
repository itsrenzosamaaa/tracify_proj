import React from "react";
import { Paper } from '@mui/material';
import { Box, Typography } from '@mui/joy';

const Badges = ({ user }) => {
    return (
        <>
            <Box sx={{ padding: '1rem 1rem 1rem 0' }}>
                <Typography level="body-lg" fontWeight='500'>Badges</Typography>
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
                <Typography level="h1" sx={{ textAlign: 'center', wordBreak: 'break-word' }}>
                    3
                </Typography>
                <Typography>Badges Received</Typography>
            </Paper>
        </>
    )
}

export default Badges;
