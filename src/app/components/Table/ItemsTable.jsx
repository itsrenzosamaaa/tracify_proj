'use client';

import { Table, Button, Snackbar, Chip } from "@mui/joy";
import {
    Paper,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
} from "@mui/material";
import React, { useState } from "react";
import InfoIcon from '@mui/icons-material/Info';
import ItemRequestApproveModal from "../Modal/ItemRequestApproveModal";
import ItemValidatingModal from "../Modal/ItemValidatingModal";
import ItemPublishedModal from "../Modal/ItemPublishedModal";
import ItemMissingModal from "../Modal/ItemMissingModal";
import ItemClaimRequestModal from "../Modal/ItemClaimRequestModal";
import ItemReservedModal from "../Modal/ItemReservedModal";
import { format } from "date-fns";

const ItemsTable = ({ items, fetchItems, session, isFoundItem, status }) => {
    const [approveModal, setApproveModal] = useState(null);
    const [openValidatingModal, setOpenValidatingModal] = useState(null);
    const [openPublishedModal, setOpenPublishedModal] = useState(null);
    const [openMissingModal, setOpenMissingModal] = useState(null);
    const [openClaimRequestModal, setOpenClaimRequestModal] = useState(null);
    const [openReservedModal, setOpenReservedModal] = useState(null);
    const [page, setPage] = useState(0); // Current page
    const [rowsPerPage, setRowsPerPage] = useState(5); // Items per page
    const [openSnackbar, setOpenSnackbar] = useState(false);

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
                                Item {isFoundItem ? 'Finder' : 'Owner'}
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                    display: { xs: "none", lg: "table-cell" },
                                    width: { xs: "30%", lg: "20%" }
                                }}
                            >
                                Item Name
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                    width: { xs: "30%", lg: "25%" },
                                }}
                            >
                                Date
                            </TableCell>
                            {isFoundItem && status === "Request" && (
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#f5f5f5",
                                        display: { xs: "none", lg: "table-cell" },
                                        width: { xs: "30%", lg: "15%" },
                                    }}
                                >
                                    Status
                                </TableCell>
                            )}
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
                                <TableCell sx={{ width: { xs: "30%", lg: "20%" } }}>
                                    {row.user.firstname} {row.user.lastname}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        display: { xs: "none", lg: "table-cell" },
                                        width: { xs: "30%", lg: "20%" }
                                    }}
                                >
                                    {row.item.name}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        display: { xs: "none", lg: "table-cell" },
                                        width: { xs: "30%", lg: "25%" },
                                    }}
                                >
                                    {row.item.isFoundItem ? (
                                        {
                                            Published: row.item.datePublished,
                                            Request: row.item.dateRequest,
                                            "Surrender Pending": row.item.dateValidating,
                                        }[row.item.status] ? (
                                            format(
                                                new Date(
                                                    {
                                                        Published: row.item.datePublished,
                                                        Request: row.item.dateRequest,
                                                        "Surrender Pending": row.item.dateValidating,
                                                    }[row.item.status]
                                                ),
                                                "MMMM dd, yyyy - hh:mm a"
                                            )
                                        ) : (
                                            "N/A"
                                        )
                                    ) : (
                                        {
                                            Missing: row.item.dateMissing,
                                            Request: row.item.dateRequest,
                                            Unclaimed: row.item.dateUnclaimed,
                                        }[row.item.status] ? (
                                            format(
                                                new Date(
                                                    {
                                                        Missing: row.item.dateMissing,
                                                        Request: row.item.dateRequest,
                                                        Unclaimed: row.item.dateUnclaimed,
                                                    }[row.item.status]
                                                ),
                                                "MMMM dd, yyyy - hh:mm a"
                                            )
                                        ) : (
                                            "N/A"
                                        )
                                    )}
                                </TableCell>
                                {row.item.isFoundItem && (row.item.status === "Request" || row.item.status === "Surrender Pending") && (
                                    <TableCell
                                        sx={{
                                            display: { xs: "none", lg: "table-cell" },
                                            width: { xs: "30%", lg: "15%" }
                                        }}
                                    >
                                        <Chip variant="solid" color={row.item.status === "Request" ? 'neutral' : 'warning'}>
                                            {row.item.status === "Request"
                                                ? "Request"
                                                : row.item.status === "Surrender Pending"
                                                    ? "Surrender Pending"
                                                    : "N/A"
                                            }
                                        </Chip>
                                    </TableCell>
                                )}
                                <TableCell
                                    sx={{
                                        display: 'flex',
                                        gap: 1,
                                        alignItems: 'center',
                                    }}
                                >
                                    {/* Action Buttons */}
                                    {row.item.status === 'Request' && (
                                        <>
                                            <Button onClick={() => setApproveModal(row._id)} size="small" sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button onClick={() => setApproveModal(row._id)} size="small" sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon fontSize="small" /></Button>
                                            <ItemRequestApproveModal session={session} row={row} open={approveModal} onClose={() => setApproveModal(null)} refreshData={fetchItems} />
                                        </>
                                    )}
                                    {row.item.status === 'Surrender Pending' && (
                                        <>
                                            <Button onClick={() => setOpenValidatingModal(row._id)} size="small" sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button onClick={() => setOpenValidatingModal(row._id)} size="small" sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon /></Button>
                                            <ItemValidatingModal row={row} open={openValidatingModal} onClose={() => setOpenValidatingModal(null)} refreshData={fetchItems} />
                                        </>
                                    )}
                                    {row.item.status === 'Published' && (
                                        <>
                                            <Button onClick={() => setOpenPublishedModal(row._id)} size="small" sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button onClick={() => setOpenPublishedModal(row._id)} size="small" sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon /></Button>
                                            <ItemPublishedModal row={row} open={openPublishedModal} onClose={() => setOpenPublishedModal(null)} refreshData={fetchItems} snackBar={setOpenSnackbar} />
                                        </>
                                    )}
                                    {row.item.status === 'Missing' && (
                                        <>
                                            <Button onClick={() => setOpenMissingModal(row._id)} size="small" sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button onClick={() => setOpenMissingModal(row._id)} size="small" sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon /></Button>
                                            <ItemMissingModal row={row} open={openMissingModal} onClose={() => setOpenMissingModal(null)} refreshData={fetchItems} snackBar={setOpenSnackbar} />
                                        </>
                                    )}
                                    {row.item.status === 'Claim Request' && (
                                        <>
                                            <Button onClick={() => setOpenClaimRequestModal(row._id)} sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button onClick={() => setOpenClaimRequestModal(row._id)} sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon fontSize="small" /></Button>
                                            <ItemClaimRequestModal row={row} open={openClaimRequestModal} onClose={() => setOpenClaimRequestModal(null)} fetch={fetch} />
                                        </>
                                    )}
                                    {row.item.status === 'Reserved' && (
                                        <>
                                            <Button onClick={() => setOpenReservedModal(row._id)} sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button onClick={() => setOpenReservedModal(row._id)} sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon fontSize="small" /></Button>
                                            <ItemReservedModal row={row} open={openReservedModal} onClose={() => setOpenReservedModal(null)} refreshData={fetchItems} />
                                        </>
                                    )}
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
            <Snackbar
                autoHideDuration={5000}
                open={openSnackbar}
                variant="solid"
                color="success"
                onClose={(event, reason) => {
                    if (reason === 'clickaway') {
                        return;
                    }
                    setOpenSnackbar(false);
                }}
            >
                <div>
                    Item details updated successfully!
                </div>
            </Snackbar>
        </>
    );
};

export default ItemsTable;
