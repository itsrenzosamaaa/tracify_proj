'use client'

import React, { useState } from 'react';
import { Paper, TableContainer, TableHead, TableRow, TableBody, TableCell, TablePagination } from '@mui/material';
import { Box, Table, Typography, Button, Divider } from '@mui/joy';

const prefixFound = 'FI-';

const foundItems = [
    { id: prefixFound + String(21).padStart(4, "0"), name: 'Wallet', date: '09/21/2024' },
    { id: prefixFound + String(22).padStart(4, "0"), name: 'T-Shirt', date: '09/21/2024' },
    { id: prefixFound + String(23).padStart(4, "0"), name: 'Earphones', date: '09/21/2024' },
    { id: prefixFound + String(24).padStart(4, "0"), name: 'Laptop', date: '09/20/2024' },
    { id: prefixFound + String(25).padStart(4, "0"), name: 'Book', date: '09/20/2024' },
    { id: prefixFound + String(26).padStart(4, "0"), name: 'Umbrella', date: '09/19/2024' },
    { id: prefixFound + String(27).padStart(4, "0"), name: 'Headphones', date: '09/18/2024' },
];

const RecentFoundItems = () => {
    // State to manage pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5); // Items per page

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset page to the first one when changing rows per page
    };

    // Paginate the found items
    const paginatedItems = foundItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper elevation={2}>
            <Box
                sx={{
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Divider>
                    <Typography level="body-lg" fontWeight="500">
                        Recent Found Items
                    </Typography>
                </Divider>
                <TableContainer
                    sx={{
                        height: '300px', // Set fixed height
                        overflowY: 'auto', // Enable scrolling when overflow
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Item</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>
                                        <Button>Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Pagination controls */}
                <TablePagination
                    component="div"
                    count={foundItems.length} // Total number of items
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]} // Options for rows per page
                />
            </Box>
        </Paper>
    );
};

export default RecentFoundItems;
