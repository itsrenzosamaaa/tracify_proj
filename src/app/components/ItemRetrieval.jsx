'use client'

import React, { useState } from 'react'
import { Grid, Box, FormControl, FormLabel, Chip, RadioGroup, Radio, Button } from '@mui/joy'
import { Paper, Badge } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check';
import ItemsTable from './Table/ItemsTable'
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';

const ItemRetrievalList = ({ items }) => {
    const [status, setStatus] = useState('Claim Request');

    const filteredItems = items.filter(item => item.status === status)
    const statusOptions = ['Claim Request', 'Reserved'];

    return (
        <>
            <TitleBreadcrumbs title="List of Claim Requests" text="Item Retrieval" />

            <Grid container spacing={2}>
                <Grid item xs={12} lg={12}>
                    <Paper elevation={2} sx={{ padding: '1rem' }}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <FormControl>
                                <FormLabel>Filter by Status</FormLabel>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    <RadioGroup
                                        name="status-selection"
                                        aria-labelledby="status-selection"
                                        orientation="horizontal"
                                        sx={{ flexWrap: 'wrap', gap: 1 }}
                                    >
                                        {statusOptions.map((name) => {
                                            const checked = status === name;
                                            const chipContent = (
                                                <Chip
                                                    key={name}
                                                    variant="plain"
                                                    color={checked ? 'primary' : 'neutral'}
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

                                            return (
                                                <Badge
                                                    key={name}
                                                    badgeContent={1}
                                                    color="error"
                                                >
                                                    {chipContent}
                                                </Badge>
                                            );
                                        })}
                                    </RadioGroup>
                                </Box>
                            </FormControl>
                        </Box>
                        <ItemsTable items={filteredItems} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

export default ItemRetrievalList;
