'use client'

import React, { useState } from 'react'
import { Grid, Box, FormControl, FormLabel, Chip, RadioGroup, Radio, Button } from '@mui/joy'
import { Paper, Badge } from '@mui/material'
import ItemsTable from './Table/ItemsTable'
import AddIcon from '@mui/icons-material/Add';
import PublishFoundItem from './Modal/PublishFoundItem';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';

const FoundItemsList = ({ finders, fetchItems, session }) => {
    const [status, setStatus] = useState('Published');
    const [open, setOpen] = useState(false);

    // Define status options
    const statusOptions = ['Published', 'Request']; // Note: We'll group 'Request' and 'Surrender Pending' as one category
    const requestStatuses = ['Request', 'Surrender Pending']; // Treat both as 'Request'

    // Count how many items have each status (group "Request" and "Surrender Pending" together)
    const statusCounts = statusOptions.reduce((acc, currentStatus) => {
        if (currentStatus === 'Request') {
            acc['Request'] = finders.filter(finder => requestStatuses.includes(finder.item.status)).length;
        } else {
            acc[currentStatus] = finders.filter(finder => finder.item.status === currentStatus).length;
        }
        return acc;
    }, {});

    // Filter items based on selected status (treating 'Request' and 'Surrender Pending' as 'Request')
    const filteredItems = finders.filter(finder => {
        if (status === 'Request') {
            return requestStatuses.includes(finder.item.status);
        }
        return finder.item.status === status;
    });

    // Render individual status options with badge count
    const StatusChip = ({ name, count, isChecked }) => (
        <Badge
            badgeContent={count}
            color="error"
            key={name}
        >
            <Chip
                variant="plain"
                color={isChecked ? 'primary' : 'neutral'}
                onClick={() => setStatus(name)}
                sx={{ cursor: 'pointer' }}
            >
                <Radio
                    variant="outlined"
                    color={isChecked ? 'primary' : 'neutral'}
                    disableIcon
                    overlay
                    label={name}
                    value={name}
                    checked={isChecked}
                    onChange={() => setStatus(name)}
                />
            </Chip>
        </Badge>
    );

    return (
        <>
            <TitleBreadcrumbs title="List of Found Items" text="Found Items" />

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
                                            const isChecked = status === name;
                                            const itemCount = statusCounts[name];
                                            return itemCount > 0 ? (
                                                <StatusChip key={name} name={name} count={itemCount} isChecked={isChecked} />
                                            ) : (
                                                <StatusChip key={name} name={name} count={0} isChecked={isChecked} />
                                            );
                                        })}
                                    </RadioGroup>
                                </Box>
                            </FormControl>
                            <Button startDecorator={<AddIcon />} onClick={() => setOpen(true)}>
                                Publish a Found Item
                            </Button>
                            <PublishFoundItem open={open} onClose={() => setOpen(false)} fetchItems={fetchItems} />
                        </Box>
                        <ItemsTable session={session} items={filteredItems} fetchItems={fetchItems} isFoundItem={true} status={status === 'Published' ? 'Published' : 'Request'} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
}

export default FoundItemsList;
