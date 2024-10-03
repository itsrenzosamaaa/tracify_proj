import React from "react";
import { Paper } from '@mui/material';
import { Box, Typography } from '@mui/joy';

const Bio = ({ user }) => {
    return (
        <Paper elevation={2}>
            <Box
                sx={{
                    padding: "1rem",
                    display: "flex",
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '8.75rem', 
                    maxHeight: '8.75rem', 
                    overflowY: 'auto',
                    wordWrap: 'break-word', 
                    overflowWrap: 'break-word', 
                }}
            >
                <Typography variant="body2" sx={{ textAlign: 'center', wordBreak: 'break-word' }}>
                    hahaha
                </Typography>
            </Box>
        </Paper>
    )
}

export default Bio;
