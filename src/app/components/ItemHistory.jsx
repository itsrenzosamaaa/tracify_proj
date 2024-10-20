'use client';

import React, { useState } from 'react';
import { Grid, Box, FormControl, FormLabel, Select, Option } from '@mui/joy';
import { Paper } from '@mui/material';
import ItemsTable from './Table/ItemsTable';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';

const ItemHistory = () => {
    const [category, setCategory] = useState('Found Items');
    const [foundStatus, setFoundStatus] = useState('Resolved');
    const [lostStatus, setLostStatus] = useState('Claimed');

    const items = [];
    const filteredItems = items.filter(item => item.status === (category === 'Found Items' ? foundStatus : lostStatus));

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
                            <FormControl>
                                <FormLabel>Filter by Status</FormLabel>
                                <Select
                                    value={category === 'Found Items' ? foundStatus : lostStatus}
                                    onChange={(e, newValue) => {
                                        const value = newValue;
                                        if (category === 'Found Items') {
                                            setFoundStatus(value);
                                        } else {
                                            setLostStatus(value);
                                        }
                                    }}
                                    sx={{ mt: 1 }}
                                >
                                    {category === 'Found Items'
                                        ? ['Resolved', 'Invalid'].map((name) => (
                                            <Option key={name} value={name}>
                                                {name}
                                            </Option>
                                        ))
                                        : ['Claimed', 'Invalid'].map((name) => (
                                            <Option key={name} value={name}>
                                                {name}
                                            </Option>
                                        ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <ItemsTable items={filteredItems} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default ItemHistory;
