'use client';

import React, { useState } from 'react';
import { Grid, Box, FormControl, FormLabel, Select, Option } from '@mui/joy';
import { Paper } from '@mui/material';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import ItemsHistoryTable from './Table/ItemsHistoryTable';

const ItemHistory = ({ items }) => {
    const [category, setCategory] = useState('Found Items');

    const filteredItems = items.filter(item => item.itemType === category);

    return (
        <>
            <TitleBreadcrumbs title="List of Resolved Items" text="Item History" />

            <Grid container spacing={2}>
                <Grid item xs={12} lg={12}>
                    <Paper elevation={2} sx={{ padding: '1rem' }}>
                        <Box sx={{ mb: 3, display: 'flex', gap: 10 }}>
                            <FormControl>
                                <FormLabel>Filter by Category</FormLabel>
                                <Select
                                    value={category}
                                    onChange={(e, value) => setCategory(value)}
                                    sx={{ mt: 1 }}
                                >
                                    {['Found Items', 'Lost Items'].map((name) => (
                                        <Option key={name} value={name}>
                                            {name}
                                        </Option>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <ItemsHistoryTable items={filteredItems} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default ItemHistory;
