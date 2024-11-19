'use client';

import { Table, Button, Chip } from "@mui/joy";
import {
    Paper,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
} from "@mui/material";
import { format, parseISO } from 'date-fns';
import React, { useState } from "react";

const ItemsHistoryTable = ({ items, fetch }) => {
    const [page, setPage] = useState(0); // Current page
    const [rowsPerPage, setRowsPerPage] = useState(5); // Items per page

    // Handle changing the page
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle changing the number of rows per page
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page
    };

    // Calculate the items to be displayed on the current page
    const displayedItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            <TableContainer
                component={Paper}
                elevation={2}
                sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    maxWidth: "100%",
                    width: "100%",
                    height: '320px',
                }}
            >
                <Table
                    variant="outlined"
                    sx={{
                        minWidth: 650,
                        borderCollapse: "collapse",
                        "@media (max-width: 600px)": {
                            minWidth: 600,
                        },
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                    width: { xs: "30%", lg: "20%" },
                                }}
                            >
                                Item
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                    display: { xs: "none", lg: "table-cell" },
                                }}
                            >
                                Date
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                    display: { xs: "none", lg: "table-cell" },
                                }}
                            >
                                Time
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                    display: { xs: "none", lg: "table-cell" },
                                }}
                            >
                                Status
                            </TableCell>
                            <TableCell
                                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedItems.map((row) => (
                            <TableRow key={row._id}>
                                <TableCell sx={{ width: { xs: "30%", lg: "20%" } }}>
                                    {row.name}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        display: { xs: "none", lg: "table-cell" },
                                    }}
                                >
                                    {row.itemType === 'Found Items' && row.dateResolved ? (
                                        format(parseISO(row.dateResolved), 'MMMM dd, yyyy')
                                    ) : row.dateClaimed ? (
                                        format(parseISO(row.dateClaimed), 'MMMM dd, yyyy')
                                    ) : row.dateDecline ? (
                                        format(parseISO(row.dateDecline), 'MMMM dd, yyyy')
                                    ) : (
                                        format(parseISO(row.dateCanceled), 'MMMM dd, yyyy')
                                    )}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        display: { xs: "none", lg: "table-cell" },
                                    }}
                                >
                                    {row.itemType === 'Found Items' && row.dateResolved ? (
                                        format(
                                            new Date(new Date(row.dateResolved).setHours(...row.time.split(':'))),
                                            'hh:mm a'
                                        )
                                    ) : row.dateClaimed ? (
                                        format(
                                            new Date(new Date(row.dateClaimed).setHours(...row.time.split(':'))),
                                            'hh:mm a'
                                        )
                                    ) : row.dateDecline ? (
                                        format(
                                            new Date(new Date(row.dateDecline).setHours(...row.time.split(':'))),
                                            'hh:mm a'
                                        )
                                    ) : row.dateCanceled ? (
                                        format(
                                            new Date(new Date(row.dateCanceled).setHours(...row.time.split(':'))),
                                            'hh:mm a'
                                        )
                                    ) : null}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        display: { xs: "none", lg: "table-cell" },
                                    }}
                                >
                                    <Chip variant="solid" color={row.status === 'Invalid' || row.status === 'Canceled' ? 'danger' : 'success'}>{row.status}</Chip>
                                </TableCell>
                                <TableCell sx={{ display: 'flex', gap: 1 }}>
                                    
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={items.length} // Total number of items
                rowsPerPage={rowsPerPage} // Current rows per page
                page={page} // Current page
                onPageChange={handleChangePage} // Page change handler
                onRowsPerPageChange={handleChangeRowsPerPage} // Rows per page change handler
            />
        </>
    );
};

export default ItemsHistoryTable;
