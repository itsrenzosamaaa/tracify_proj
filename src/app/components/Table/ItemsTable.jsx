'use client';

import { Table, Button } from "@mui/joy";
import {
    Paper,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination
} from "@mui/material";
import React, { useState } from "react";
import InfoIcon from '@mui/icons-material/Info';
import ItemRequestApproveModal from "../Modal/ItemRequestApproveModal";
import ItemValidatingModal from "../Modal/ItemValidatingModal";
import ItemPublishedModal from "../Modal/ItemPublishedModal";

const ItemsTable = ({ items, fetch }) => {
    const [approveModal, setApproveModal] = useState(null);
    const [openValidatingModal, setOpenValidatingModal] = useState(null);
    const [openPublishedModal, setOpenPublishedModal] = useState(null);
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
                                User
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f5f5f5",
                                    display: { xs: "none", lg: "table-cell" },
                                }}
                            >
                                Item
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
                                <TableCell
                                    sx={{ width: { xs: "30%", lg: "20%" } }}
                                >
                                    {row.finder && `${row.finder.firstname} ${row.finder.lastname}`}
                                    {row.owner && `${row.owner.firstname} ${row.owner.lastname}`}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        display: { xs: "none", lg: "table-cell" },
                                    }}
                                >
                                    {row.name}
                                </TableCell>
                                <TableCell sx={{ display: 'flex', gap: 1 }}>
                                {
                                        row.status === 'Validating' 
                                        &&
                                        <>
                                            <Button onClick={() => setOpenValidatingModal(row._id)} size="small" sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button onClick={() => setOpenValidatingModal(row._id)} size="small" sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon /></Button>
                                            <ItemValidatingModal row={row} open={openValidatingModal} onClose={() => setOpenValidatingModal(null)} fetch={fetch} />
                                        </>
                                    }
                                    {
                                        row.status === 'Published' 
                                        &&
                                        <>
                                            <Button onClick={() => setOpenPublishedModal(row._id)} size="small" sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button onClick={() => setOpenPublishedModal(row._id)} size="small" sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon /></Button>
                                            <ItemPublishedModal row={row} open={openPublishedModal} onClose={() => setOpenPublishedModal(null)} />
                                        </>
                                    }
                                    {
                                        row.status === 'Missing' 
                                        &&
                                        <>
                                            <Button size="small" sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button size="small" sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon /></Button>
                                        </>
                                    }
                                    {
                                        row.status === 'Request' 
                                        &&
                                        <>
                                            <Button onClick={() => setApproveModal(row._id)} sx={{ display: { xs: 'none', lg: 'block' } }}>View Details</Button>
                                            <Button onClick={() => setApproveModal(row._id)} sx={{ display: { xs: 'block', lg: 'none' } }}><InfoIcon fontSize="small" /></Button>
                                            <ItemRequestApproveModal row={row} open={approveModal} onClose={() => setApproveModal(null)} fetch={fetch} />
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

export default ItemsTable;
