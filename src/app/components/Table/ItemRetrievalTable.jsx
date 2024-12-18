'use client';

import { Table, Button, Chip, Box, Card, CardContent, CardActions, Typography, Snackbar } from "@mui/joy";
import {
    Paper,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    useMediaQuery
} from "@mui/material";
import React, { useState } from "react";
import InfoIcon from '@mui/icons-material/Info';
import ItemClaimRequestModal from "../Modal/ItemClaimRequestModal";
import ItemReservedModal from "../Modal/ItemReservedModal";
import { format, parseISO } from 'date-fns';
import CompletedModal from "../Modal/CompletedModal";
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

const ItemRetrievalTable = ({ items, fetchItems }) => {
    const [openClaimRequestModal, setOpenClaimRequestModal] = useState(null);
    const [openReservedModal, setOpenReservedModal] = useState(null);
    const [openCompletedModal, setOpenCompletedModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Tracks current page
    const [rowsPerPage, setRowsPerPage] = useState(5); // Tracks rows per page
    const [message, setMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(null);
    const isMobile = useMediaQuery('(max-width:720px)');

    // Handle changing the page
    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage + 1);
    };

    // Handle changing the number of rows per page
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1); // Reset to the first page
    };

    const paginatedItems = items.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );


    return (
        <>
            {
                isMobile ? (
                    <>
                        {
                            paginatedItems.length !== 0 ? (
                                <>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        {paginatedItems.map((row) => (
                                            <Card key={row._id} variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent>
                                                    <Typography level="h6">
                                                        <strong>Claimer:</strong>  {row?.owner?.user?.firstname} {row?.owner?.user?.lastname}
                                                    </Typography>
                                                    <Typography level="body1">
                                                        <strong>Item Name:</strong> {row.finder.item.name}
                                                    </Typography>
                                                    <Typography level="body2" color="text.secondary">
                                                        <strong>Date:</strong> {''} {format(parseISO(row.datePending), "MMMM dd, yyyy - hh:mm a")}
                                                    </Typography>
                                                    <Typography level="body2" color="text.secondary">
                                                        <strong>Request Status:</strong> {''}
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
                                                    </Typography>
                                                    <Typography level="body2" color="text.secondary">
                                                        <strong>Item Status:</strong> {''}
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
                                                    </Typography>
                                                </CardContent>
                                                <CardActions>
                                                    {
                                                        row.request_status === 'Pending'
                                                        &&
                                                        <>
                                                            <Button size='small' onClick={() => setOpenClaimRequestModal(row._id)}>View Details</Button>
                                                            <ItemClaimRequestModal row={row} open={openClaimRequestModal} onClose={() => setOpenClaimRequestModal(null)} refreshData={fetchItems} setMessage={setMessage} setOpenSnackbar={setOpenSnackbar} />
                                                        </>
                                                    }
                                                    {
                                                        row.request_status === 'Approved'
                                                        &&
                                                        <>
                                                            <Button size="small" onClick={() => setOpenReservedModal(row._id)}>View Details</Button>
                                                            <ItemReservedModal row={row} open={openReservedModal} onClose={() => setOpenReservedModal(null)} refreshData={fetchItems} setMessage={setMessage} setOpenSnackbar={setOpenSnackbar} />
                                                        </>
                                                    }
                                                    {
                                                        (row.request_status === 'Completed' || row.request_status === "Declined" || row.request_status === "Canceled")
                                                        &&
                                                        <>
                                                            <Button size="small" onClick={() => setOpenCompletedModal(row._id)}>View Details</Button>
                                                            <CompletedModal row={row} open={openCompletedModal} onClose={() => setOpenCompletedModal(null)} />
                                                        </>
                                                    }
                                                </CardActions>
                                            </Card>
                                        ))}
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                        <Button
                                            onClick={() => {
                                                setCurrentPage((prev) => Math.max(prev - 1, 1));
                                                window.scrollTo(0, 0);
                                            }}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Typography sx={{ mx: 2 }}>
                                            Page {currentPage} of {Math.ceil(items.length / rowsPerPage)}
                                        </Typography>
                                        <Button
                                            onClick={() => {
                                                setCurrentPage((prev) =>
                                                    Math.min(prev + 1, Math.ceil(items.length / rowsPerPage))
                                                )
                                                window.scrollTo(0, 0);
                                            }}
                                            disabled={currentPage === Math.ceil(items.length / rowsPerPage)}
                                        >
                                            Next
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 3 }}>
                                    <Typography level="title-sm">
                                        No items found for the current filter.
                                    </Typography>
                                    <Typography level="title-sm">
                                        Try adjusting the filters or check back later.
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <EmojiObjectsIcon sx={{ fontSize: 50, color: "text.secondary" }} />
                                    </Box>
                                    <Button variant="outlined" onClick={() => fetchItems()} sx={{ mt: 2 }}>
                                        Retry
                                    </Button>
                                </Box>
                            )
                        }
                    </>
                ) : (
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
                                        "& th, & td": {
                                            fontSize: "0.8rem", // Smaller font size for mobile
                                            padding: "6px", // Reduce padding
                                        },
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
                                                width: { xs: '90px', md: '150px' }
                                            }}
                                        >
                                            Request Status
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontWeight: "bold",
                                                backgroundColor: "#f5f5f5",
                                                width: { xs: '140px', md: '150px' }
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
                                {
                                    paginatedItems.length !== 0 ? (
                                        <>
                                            <TableBody>
                                                {paginatedItems.map((row) => (
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
                                                        <TableCell sx={{ width: { xs: '90px', md: '150px' } }}>
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
                                                        <TableCell sx={{ width: { xs: '140px', md: '150px' } }}>
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
                                                                    <ItemClaimRequestModal row={row} open={openClaimRequestModal} onClose={() => setOpenClaimRequestModal(null)} refreshData={fetchItems} setMessage={setMessage} setOpenSnackbar={setOpenSnackbar} />
                                                                </>
                                                            }
                                                            {
                                                                row.request_status === 'Approved'
                                                                &&
                                                                <>
                                                                    <Button size="small" onClick={() => setOpenReservedModal(row._id)} sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                                                    <Button size="small" onClick={() => setOpenReservedModal(row._id)} sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon fontSize="small" /></Button>
                                                                    <ItemReservedModal row={row} open={openReservedModal} onClose={() => setOpenReservedModal(null)} refreshData={fetchItems} setMessage={setMessage} setOpenSnackbar={setOpenSnackbar} />
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
                                        </>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",  // Center content vertically
                                                gap: 2,
                                                py: 4,
                                                border: "none", // Remove any borders if applied
                                                width: "590%", // Ensure it spans the width of its parent container
                                                height: "100%",
                                                backgroundColor: "transparent", // Avoid background interference
                                                boxSizing: "border-box", // Include padding and border in width and height
                                            }}
                                        >
                                            <Typography level="h6" color="text.secondary">
                                                No items found for the current filter.
                                            </Typography>
                                            <Typography level="body2" color="text.secondary">
                                                Try adjusting the filters or check back later.
                                            </Typography>
                                            <Box sx={{ mt: 2 }}>
                                                <EmojiObjectsIcon sx={{ fontSize: 50, color: "text.secondary" }} />
                                            </Box>
                                            <Button variant="outlined" onClick={() => fetchItems()} sx={{ mt: 2 }}>
                                                Retry
                                            </Button>
                                        </Box>
                                    )
                                }
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={5} // Make sure the rowsPerPage options are an array
                            component="div"
                            count={items.length} // Total number of items
                            rowsPerPage={rowsPerPage} // Current rows per page
                            page={currentPage - 1} // TablePagination expects 0-based page index
                            onPageChange={handleChangePage} // Page change handler
                            onRowsPerPageChange={handleChangeRowsPerPage} // Rows per page change handler
                        />
                    </>
                )
            }
            <Snackbar
                autoHideDuration={5000}
                open={openSnackbar}
                variant="solid"
                color={openSnackbar}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') {
                        return;
                    }
                    setOpenSnackbar(false);
                }}
            >
                {message}
            </Snackbar>
        </>
    );
};

export default ItemRetrievalTable;
