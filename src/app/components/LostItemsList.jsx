'use client';

import React, { useState } from 'react';
import { Grid, Box, FormControl, FormLabel, Chip, RadioGroup, Radio, Button } from '@mui/joy';
import { Paper, Badge } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ItemsTable from './Table/ItemsTable';
import PublishLostItem from './Modal/PublishLostItems';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';

const LostItemsList = ({ items, fetchItems }) => {
    const [status, setStatus] = useState('Missing');
    const [open, setOpen] = useState(false);

    const statusOptions = ['Missing', 'Request', 'Tracked'];

    // Calculate counts for each status
    const statusCounts = statusOptions.reduce((acc, currentStatus) => {
        acc[currentStatus] = items.filter(item => item.status === currentStatus).length;
        return acc;
    }, {});

    const filteredItems = items.filter(item => item.status === status);

    return (
        <>
            <TitleBreadcrumbs title="List of Reported Lost Items" text="Lost Items" />

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
                                            const itemCount = statusCounts[name];

                                            const chipContent = (
                                                <Chip
                                                    key={name}
                                                    variant="plain"
                                                    color={checked ? 'primary' : 'neutral'}
                                                    onClick={() => setStatus(name)}
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

                                            return itemCount > 0 ? (
                                                <Badge
                                                    key={name}
                                                    badgeContent={itemCount}
                                                    color="error"
                                                >
                                                    {chipContent}
                                                </Badge>
                                            ) : (
                                                <React.Fragment key={name}>
                                                    {chipContent}
                                                </React.Fragment>
                                            );
                                        })}
                                    </RadioGroup>
                                </Box>
                            </FormControl>
                            <Button startDecorator={<AddIcon />} onClick={() => setOpen(true)}>Publish a Lost Item</Button>
                            <PublishLostItem open={open} onClose={() => setOpen(false)} fetchItems={fetchItems} />
                        </Box>
                        <ItemsTable items={filteredItems} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
}

export default LostItemsList;
