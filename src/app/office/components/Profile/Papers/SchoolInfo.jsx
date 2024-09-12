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
                    <Typography>Grade/Year:</Typography>
                    <Typography>Course/Section:</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography>{user.schoolCategory}</Typography>
                    <Typography>{user.levelORAMBOT}</Typography>
                    <Typography>{user.course}</Typography>
                </Box>
            </Box>
        </Paper>
    )
}

export default SchoolInfo