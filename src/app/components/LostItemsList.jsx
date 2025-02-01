'use client';

import React, { useState } from 'react';
import { Grid, Box, FormControl, FormLabel, Chip, RadioGroup, Radio, Button, Select, Option, Input, Snackbar } from '@mui/joy';
import { Paper, Badge, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ItemsTable from './Table/ItemsTable';
import PublishLostItem from './Modal/PublishLostItems';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Search } from '@mui/icons-material';

const LostItemsList = ({ owners, fetchItems, session, locationOptions }) => {
    const [status, setStatus] = useState('Missing');
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)');
    const [openSnackbar, setOpenSnackbar] = useState(null);
    const [message, setMessage] = useState('');

    const statusOptions = ['Missing', 'Request', 'Declined', 'Canceled'];

    // Calculate counts for each status
    const statusCounts = statusOptions.reduce((acc, currentStatus) => {
        acc[currentStatus] = owners.filter(owner => owner.item.status === currentStatus).length;
        return acc;
    }, {});

    const filteredItems = owners.filter(owner => owner.item.status === status);

    return (
        <>
            <TitleBreadcrumbs title="List of Lost Items" text="Lost Items" />

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ padding: '1rem', borderTop: '3px solid #3f51b5' }}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <FormControl>
                                <FormLabel>Filter by Status</FormLabel>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    {isMobile ? (
                                        <>
                                            <Select
                                                value={status}
                                                onChange={(e, newValue) => setStatus(newValue)}
                                                size="sm"
                                            >
                                                {statusOptions.map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name} ({statusCounts[name] || 0})
                                                    </Option>
                                                ))}
                                            </Select>
                                        </>
                                    ) : (
                                        <>
                                            <RadioGroup
                                                name="status-selection"
                                                aria-labelledby="status-selection"
                                                orientation="horizontal"
                                                sx={{ display: 'flex', gap: 1 }}
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
                                        </>
                                    )}
                                </Box>
                            </FormControl>
                            <Button size="small" startDecorator={<AddIcon />} onClick={() => setOpen(true)}>Post Lost Item</Button>
                            <PublishLostItem open={open} onClose={() => setOpen(false)} fetchItems={fetchItems} setOpenSnackbar={setOpenSnackbar} setMessage={setMessage} locationOptions={locationOptions} />
                        </Box>
                        <Input startDecorator={<Search />} sx={{ mb: 3, width: isMobile ? '100%' : '30%' }} />
                        <ItemsTable locationOptions={locationOptions} session={session} items={filteredItems} fetchItems={fetchItems} isFoundItem={false} />
                    </Paper>
                </Grid>
            </Grid>
            <Snackbar
                autoHideDuration={5000}
                open={openSnackbar}
                variant="solid"
                color={openSnackbar}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') {
                        return;
                    }
                    setOpenSnackbar(null);
                }}
            >
                {message}
            </Snackbar>
        </>
    );
}

export default LostItemsList;
