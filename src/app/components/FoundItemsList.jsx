'use client'

import React, { useState } from 'react'
import { Grid, Box, FormControl, FormLabel, Chip, RadioGroup, Radio, Button } from '@mui/joy'
import { Paper, Badge } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check';
import ItemsTable from './Table/ItemsTable'
import AddIcon from '@mui/icons-material/Add';
import PublishFoundItem from './Modal/PublishFoundItem';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';

const FoundItemsList = ({ items }) => {
    const [status, setStatus] = useState('Published');
    const [open, setOpen] = useState(false);

    const filteredItems = items.filter(item => item.status === status)
    const statusOptions = ['Published', 'Request', 'Validating'];

    return (
        <>
            <TitleBreadcrumbs title="List of Reported Found Items" text="Found Items" />

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
                            <Button startDecorator={<AddIcon />} onClick={() => setOpen(true)}>Publish a Found Item</Button>
                            <PublishFoundItem open={open} onClose={() => setOpen(false)} />
                        </Box>
                        <ItemsTable items={filteredItems} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

export default FoundItemsList;
