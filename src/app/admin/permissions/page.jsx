'use client'

import React, { useState } from 'react';
import { Box, Typography, Table, Stack, FormLabel, Input, FormControl, Button } from '@mui/joy';
import { Paper, Grid, TableContainer, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

const Page = () => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <>
            <Box
                sx={{
                    marginTop: '60px', // Ensure space for header
                    marginLeft: { xs: '0px', lg: '250px' }, // Shift content when sidebar is visible on large screens
                    padding: '20px',
                    transition: 'margin-left 0.3s ease',
                }}
            >
                safsad
            </Box>
        </>
    );
}

export default Page;
