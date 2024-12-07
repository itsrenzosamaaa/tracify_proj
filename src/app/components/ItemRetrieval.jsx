'use client'

import React, { useState } from 'react';
import { Grid, Box, Button, Menu, MenuItem, Typography, Input } from '@mui/joy';
import { Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import PublishItemIdentified from './Modal/PublishItemIdentified';
import ItemRetrievalTable from './Table/ItemRetrievalTable';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

const ItemRetrievalList = ({ items, fetchItems }) => {
    const [anchorEl, setAnchorEl] = useState(null); // For the Menu
    const [selectedStatus, setSelectedStatus] = useState('All'); // Default status

    const filteredItems = items.filter(item => {
        return selectedStatus === 'All' || item.request_status === selectedStatus;
    });

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget); // Open the menu
    };

    const handleMenuClose = () => {
        setAnchorEl(null); // Close the menu
    };

    const handleStatusSelect = (status) => {
        setSelectedStatus(status); // Set the selected status
        handleMenuClose(); // Close the menu after selection
    };

    return (
        <>
            <TitleBreadcrumbs title="List of Item Retrievals" text="Item Retrieval" />

            <Grid container spacing={2}>
                <Grid item xs={12} lg={12}>
                    <Paper elevation={2} sx={{ padding: '1rem' }}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Input
                                startDecorator={<SearchIcon />}
                                placeholder='Search name...'
                            />
                            {/* Filter Menu */}
                            <Button
                                startDecorator={<FilterListIcon />}
                                onClick={handleMenuOpen}
                            >
                                {selectedStatus} {/* Display the selected status */}
                            </Button>

                            {/* Menu for status selection */}
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={() => handleStatusSelect('All')}>All</MenuItem>
                                <MenuItem onClick={() => handleStatusSelect('Pending')}>Pending</MenuItem>
                                <MenuItem onClick={() => handleStatusSelect('Approved')}>Approved</MenuItem>
                                <MenuItem onClick={() => handleStatusSelect('Declined')}>Declined</MenuItem>
                                <MenuItem onClick={() => handleStatusSelect('Canceled')}>Canceled</MenuItem>
                                <MenuItem onClick={() => handleStatusSelect('Completed')}>Completed</MenuItem>
                            </Menu>
                        </Box>
                        <ItemRetrievalTable items={filteredItems} fetchItems={fetchItems} selectedStatus={selectedStatus} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default ItemRetrievalList;
