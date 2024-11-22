'use client';

import { Table, Button, Tooltip, Chip } from "@mui/joy";
import {
    Paper,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    Typography
} from "@mui/material";
import React, { useState } from "react";
import InfoIcon from '@mui/icons-material/Info';
import ItemClaimRequestModal from "../Modal/ItemClaimRequestModal";
import ItemReservedModal from "../Modal/ItemReservedModal";
import { format, parseISO } from 'date-fns';
import CompletedModal from "../Modal/CompletedModal";

const ItemRetrievalTable = ({ items, fetchItems, session }) => {
    const [openClaimRequestModal, setOpenClaimRequestModal] = useState(null);
    const [openReservedModal, setOpenReservedModal] = useState(null);
    const [page, setPage] = useState(0); // Current page
    const [rowsPerPage, setRowsPerPage] = useState(5); // Items per page
    const [openCompletedModal, setOpenCompletedModal] = useState(false);

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
                    maxWidth: "100%",
                    width: "100%",
                    height: '340px',
                }}
            >
                <Table
                    stickyHeader
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
                                }}
                            >
                                Claimer
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                Item
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                Date
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                Request Status
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                Item Status
                            </TableCell>
                            <TableCell
                                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                            >
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedItems.map((row) => (
                            <TableRow key={row._id}>
                                <TableCell>
                                    {row?.owner?.user?.firstname} {row?.owner?.user?.lastname}
                                </TableCell>
                                <TableCell>
                                    {row.finder.item.name}
                                </TableCell>
                                <TableCell>
                                    {format(parseISO(row.datePending), "MMMM dd, yyyy - hh:mm a")}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        variant='solid'
                                        color={
                                            row.request_status === 'Declined'
                                                ? 'danger'
                                                : row.request_status === 'Canceled'
                                                    ? 'warning'
                                                    : row.request_status === 'Approved' || row.request_status === 'Completed'
                                                        ? 'success'
                                                        : 'primary'
                                        }
                                    >
                                        {row.request_status}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        if (row.request_status === "Pending") {
                                            return (
                                                <Chip variant="solid" color="neutral">
                                                    Not yet approved
                                                </Chip>
                                            );
                                        }

                                        if (row.request_status === "Declined" || row.request_status === "Canceled") {
                                            return (
                                                <Chip variant="solid" color="neutral">
                                                    N/A
                                                </Chip>
                                            );
                                        }

                                        const status = row.owner?.item?.status || "Unknown";
                                        const chipColor = status === "Claimed" ? "success" : "danger";

                                        return (
                                            <Chip variant="solid" color={chipColor}>
                                                {status}
                                            </Chip>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell>
                                    {
                                        row.request_status === 'Pending'
                                        &&
                                        <>
                                            <Button size='small' onClick={() => setOpenClaimRequestModal(row._id)} sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button size='small' onClick={() => setOpenClaimRequestModal(row._id)} sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon fontSize="small" /></Button>
                                            <ItemClaimRequestModal row={row} open={openClaimRequestModal} onClose={() => setOpenClaimRequestModal(null)} refreshData={fetchItems} />
                                        </>
                                    }
                                    {
                                        row.request_status === 'Approved'
                                        &&
                                        <>
                                            <Button size="small" onClick={() => setOpenReservedModal(row._id)} sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button size="small" onClick={() => setOpenReservedModal(row._id)} sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon fontSize="small" /></Button>
                                            <ItemReservedModal row={row} open={openReservedModal} onClose={() => setOpenReservedModal(null)} refreshData={fetchItems} />
                                        </>
                                    }
                                    {
                                        (row.request_status === 'Completed' || row.request_status === "Declined" || row.request_status === "Canceled")
                                        &&
                                        <>
                                            <Button size="small" onClick={() => setOpenCompletedModal(row._id)} sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button size="small" onClick={() => setOpenCompletedModal(row._id)} sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon fontSize="small" /></Button>
                                            <CompletedModal row={row} open={openCompletedModal} onClose={() => setOpenCompletedModal(null)} />
                                        </>
                                    }
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

export default ItemRetrievalTable;