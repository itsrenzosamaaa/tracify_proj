import React from "react";
import { Paper } from '@mui/material';
import { Box, Typography } from '@mui/joy';

const PersonalInfo = ({ user }) => {
    return (
        <Paper elevation={2}>
            <Box
                sx={{
                    padding: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >

                <Box sx={{ fontWeight: 700 }}>
                    <Typography>{user.role} ID:</Typography>
                    <Typography>Email Address:</Typography>
                    <Typography>Contact Number:</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography>{user.id}</Typography>
                    <Typography>{user.email}</Typography>
                    <Typography>{user.contactNumber}</Typography>
                </Box>
            </Box>
        </Paper>
    )
}

export default PersonalInfo