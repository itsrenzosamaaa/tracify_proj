import React, { useState } from 'react';
import { Grid, Box, FormControl, FormLabel, Chip, RadioGroup, Radio, Button, Select, Option, Input, Snackbar } from '@mui/joy';
import { Paper, Badge, useMediaQuery } from '@mui/material';
import ItemsTable from './Table/ItemsTable';
import AddIcon from '@mui/icons-material/Add';
import PublishFoundItem from './Modal/PublishFoundItem';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import { Search } from '@mui/icons-material';

const FoundItemsList = ({ finders, fetchItems, session, locationOptions }) => {
    const [status, setStatus] = useState('Published');
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // Track search input
    const [openSnackbar, setOpenSnackbar] = useState(null);
    const [message, setMessage] = useState('');
    const isMobile = useMediaQuery('(max-width:600px)');

    // Define status options
    const statusOptions = ['Published', 'Request', 'Declined', 'Canceled']; // Group 'Request' and 'Surrender Pending'
    const requestStatuses = ['Request', 'Surrender Pending'];

    // Count how many items have each status
    const statusCounts = statusOptions.reduce((acc, currentStatus) => {
        if (currentStatus === 'Request') {
            acc['Request'] = finders.filter(finder => requestStatuses.includes(finder.item.status)).length;
        } else {
            acc[currentStatus] = finders.filter(finder => finder.item.status === currentStatus).length;
        }
        return acc;
    }, {});

    // Filter items based on selected status and search query
    const filteredItems = finders.filter(finder => {
        const matchesStatus = status === 'Request' ? requestStatuses.includes(finder.item.status) : finder.item.status === status;

        // Search across multiple fields (name, description, category, location, etc.)
        const matchesSearch =
            finder.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            finder.user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            finder.user.lastname.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Render chips for status selection
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

    console.log(locationOptions)

    return (
        <>
            <TitleBreadcrumbs title="List of Found Items" text="Found Items" />

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ padding: '1rem', borderTop: '3px solid #3f51b5' }}>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <FormControl>
                                <FormLabel>Filter by Status</FormLabel>
                                <Box sx={{ mt: 1 }}>
                                    {isMobile ? (
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
                                    ) : (
                                        <RadioGroup
                                            name="status-selection"
                                            aria-labelledby="status-selection"
                                            orientation="horizontal"
                                            sx={{ display: 'flex', gap: 1 }}
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
                                    )}
                                </Box>
                            </FormControl>
                            <Button size="small" sx={{ width: isMobile ? '50%' : '170px' }} startDecorator={<AddIcon />} onClick={() => setOpen(true)}>
                                Post Found Item
                            </Button>
                            <PublishFoundItem open={open} onClose={() => setOpen(false)} fetchItems={fetchItems} setOpenSnackbar={setOpenSnackbar} setMessage={setMessage} locationOptions={locationOptions} />
                        </Box>
                        {/* Search Input */}
                        <Input
                            startDecorator={<Search />}
                            sx={{ mb: 3, width: isMobile ? '100%' : '30%' }}
                            placeholder="Search for items"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} // Update search query
                        />
                        <ItemsTable locationOptions={locationOptions} session={session} items={filteredItems} fetchItems={fetchItems} isFoundItem={true} status={status} />
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
};

export default FoundItemsList;
