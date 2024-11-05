'use client'

import React, { useState } from 'react';
import { Paper, TableContainer, TableHead, TableRow, TableBody, TableCell, TablePagination } from '@mui/material';
import { Box, Table, Typography, Chip, Button } from '@mui/joy';

const RecentItems = ({ items, name }) => {
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
    const paginatedItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            <Box sx={{ padding: '1rem 1rem 1rem 0' }}>
                <Typography level="body-lg" fontWeight='500'>Recent {name} Items</Typography>
            </Box>
            <Paper elevation={2} sx={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}>
                <TableContainer
                    sx={{
                        height: '320px', // Set fixed height
                        overflowY: 'auto', // Enable scrolling when overflow
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Item</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedItems.map((item) => (
                                (item.status === 'Resolved' || item.status === 'Claimed' || item.status === 'Invalid') && 
                                    <TableRow key={item._id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell><Chip variant="solid" color={item.status === 'Invalid' ? 'danger' : 'success'}>{item.status}</Chip></TableCell>
                                    <TableCell>
                                        {/* <Button color={item.isFoundItem ? "success" : "danger"}>Details</Button> */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Pagination controls */}
                <TablePagination
                    component="div"
                    count={items.length} // Total number of items
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]} // Options for rows per page
                />
            </Paper>
        </>
    );
};

export default RecentItems;
