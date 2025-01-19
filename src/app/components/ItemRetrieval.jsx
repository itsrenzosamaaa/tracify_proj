'use client';

import React, { useState } from 'react';
import { Grid, Box, Button, Menu, MenuItem, Typography, Input } from '@mui/joy';
import { Paper, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import PublishItemIdentified from './Modal/PublishItemIdentified';
import ItemRetrievalTable from './Table/ItemRetrievalTable';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

const ItemRetrievalList = ({ items, fetchItems, users }) => {
    const [anchorEl, setAnchorEl] = useState(null); // For the Menu
    const [selectedStatus, setSelectedStatus] = useState('All'); // Default status
    const [searchQuery, setSearchQuery] = useState(''); // Track search input
    const isMobile = useMediaQuery('(max-width:600px)');

    // Filter the items based on status and search query
    const filteredItems = items.filter(item => {
        const matchesStatus = selectedStatus === 'All' || item.request_status === selectedStatus;

        const matchesSearch =
            item.finder.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.owner.user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.request_status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.owner.user.lastname.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    // Menu open and close handlers for selecting status
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget); // Open the menu
    };

    const handleMenuClose = () => {
        setAnchorEl(null); // Close the menu
    };

    // Set the selected status from the menu
    const handleStatusSelect = (status) => {
        setSelectedStatus(status); // Set the selected status
        handleMenuClose(); // Close the menu after selection
    };

    // Handle search query change
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value); // Update the search query
    };

    return (
        <>
            <TitleBreadcrumbs title="List of Item Retrievals" text="Item Retrieval" />

            <Grid container spacing={2}>
                <Grid item xs={12} lg={12}>
                    <Paper elevation={2} sx={{ padding: '1rem', borderTop: '3px solid #3f51b5' }}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {/* Search Input */}
                            <Input
                                startDecorator={<SearchIcon />}
                                placeholder="Search name..."
                                value={searchQuery}
                                onChange={handleSearchChange} // Update search query on input change
                                sx={{marginRight: 2, width: '50%' }}
                            />

                            {/* Filter Menu Button */}
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

                        {/* Item Retrieval Table */}
                        <ItemRetrievalTable
                            items={filteredItems}
                            fetchItems={fetchItems}
                            selectedStatus={selectedStatus}
                            users={users}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default ItemRetrievalList;
