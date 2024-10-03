import React from 'react'
import { Paper } from '@mui/material';
import { Box, Typography } from '@mui/joy';

const SchoolInfo = ({ user }) => {
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
                    <Typography>School Category:</Typography>
                    <Typography>Email Address:</Typography>
                    <Typography>Contact Number:</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography
                        sx={{
                            maxWidth: { xs: '150px', lg: 'none' }, // No limit on large screens
                            whiteSpace: { xs: 'nowrap', lg: 'normal' }, // Allow wrapping on large screens
                            overflow: { xs: 'hidden', lg: 'visible' }, // Show overflow on large screens
                            textOverflow: { xs: 'ellipsis', lg: 'clip' }, // Remove ellipsis on large screens
                        }}
                    >
                        {user.schoolCategory}
                    </Typography>
                    <Typography
                        sx={{
                            maxWidth: { xs: '150px', lg: 'none' },
                            whiteSpace: { xs: 'nowrap', lg: 'normal' },
                            overflow: { xs: 'hidden', lg: 'visible' },
                            textOverflow: { xs: 'ellipsis', lg: 'clip' },
                        }}
                    >
                        {user.email}
                    </Typography>
                    <Typography
                        sx={{
                            maxWidth: { xs: '150px', lg: 'none' },
                            whiteSpace: { xs: 'nowrap', lg: 'normal' },
                            overflow: { xs: 'hidden', lg: 'visible' },
                            textOverflow: { xs: 'ellipsis', lg: 'clip' },
                        }}
                    >
                        {user.contactNumber}
                    </Typography>
                </Box>
            </Box>
        </Paper>

    )
}

export default SchoolInfo