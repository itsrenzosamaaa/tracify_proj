'use client'

import React, { useState } from 'react'
import { Typography, Grid, Box, Link, Breadcrumbs, FormControl, FormLabel, Chip, RadioGroup, Radio, Button } from '@mui/joy'
import { Paper } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check';
import ItemsTable from './Table/ItemsTable'
import AddIcon from '@mui/icons-material/Add';

const LostItemsList = ({ items }) => {
    const [status, setStatus] = useState('Request');

    const filteredItems = items.filter(item => item.status === status)

    return (
        <>
            <Box sx={{ marginBottom: '1rem' }}>
                <Typography level="h5" letterSpacing={2} sx={{ fontSize: '24px', fontWeight: 'bold', mt: 5 }}>
                    List of Lost Items
                </Typography>
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: { xs: '14px', sm: '15px', md: '15px' } }}>
                        <Link letterSpacing={2} underline="hover" color="inherit" href="/dashboard">
                            Home
                        </Link>
                        <Typography letterSpacing={2} color="text.primary" sx={{ fontSize: { xs: '14px', sm: '15px', md: '15px' } }}>Lost Items</Typography>
                    </Breadcrumbs>
                </Grid>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} lg={12}>
                    <Paper elevation={2} sx={{ padding: '1rem' }}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <FormControl>
                                <FormLabel>Select Status</FormLabel>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    <RadioGroup
                                        name="status-selection"
                                        aria-labelledby="status-selection"
                                        orientation="horizontal"
                                        sx={{ flexWrap: 'wrap', gap: 1 }}
                                    >
                                        {['Request', 'Missing'].map((name) => {
                                            const checked = status === name;
                                            return (
                                                <Chip
                                                    key={name}
                                                    variant="plain"
                                                    color={checked ? 'primary' : 'neutral'}
                                                    startDecorator={checked && <CheckIcon sx={{ zIndex: 1, pointerEvents: 'none' }} />}
                                                    onClick={() => setStatus(name)} // Update status when Chip is clicked
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <Radio
                                                        variant="outlined"
                                                        color={checked ? 'primary' : 'neutral'}
                                                        disableIcon
                                                        overlay
                                                        label={name}
                                                        value={name}
                                                        checked={checked}
                                                        onChange={(event) => {
                                                            if (event.target.checked) {
                                                                setStatus(name);
                                                            }
                                                        }}
                                                    />
                                                </Chip>
                                            );
                                        })}
                                    </RadioGroup>
                                </Box>
                            </FormControl>
                            <Button startDecorator={<AddIcon />}>Publish a Lost Item</Button>
                        </Box>
                        <ItemsTable items={filteredItems} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

export default LostItemsList;
