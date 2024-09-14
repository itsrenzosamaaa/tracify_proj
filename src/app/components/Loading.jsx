import React from 'react'
import { Box, CircularProgress } from "@mui/joy";

const Loading = () => {
    return (
        <Box sx={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
        </Box>
    )
}

export default Loading