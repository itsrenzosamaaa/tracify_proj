'use client';

import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Button, Table } from "@mui/joy";
import { Paper, TableBody, TableCell, TableHead, TableRow, TablePagination, Divider, Chip } from "@mui/material";
import { useRouter } from "next/navigation";

const UserDashboard = ({ session, status }) => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const router = useRouter();

    const fetchItems = async (accountId) => {
        try {
            const response = await fetch(`/api/items/${accountId}`);
            const data = await response.json();
            if (response.ok) {
                setItems(data);
            } else {
                console.error('Failed to fetch item data:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch item data:', error);
        }
    };

    useEffect(() => {
        if(status === 'authenticated' && session?.user?.id){
            fetchItems(session?.user?.id);
        }
    }, [status, session?.user?.id])

    const PaperOverview = [
        { title: 'Total Found Items', quantity: items.filter(item => item.finder === session?.user?.id).length },
        { title: 'Total Lost Items', quantity: items.filter(item => item.owner === session?.user?.id).length },
        { title: 'Pending Requests', quantity: items.filter(item => item.status === 'Request').length },
        { title: 'Resolved Cases', quantity: items.filter(item => item.status === 'Resolved' || item.status === 'Claimed').length },
    ];

    const updates = [
        { type: 'Lost', item: 'Blue Wallet', time: '2 hours ago' },
        { type: 'Found', item: 'Red Umbrella', time: '1 hour ago' },
        { type: 'Badge', user: 'John Doe', badge: 'Gold', time: '3 hours ago' },
        { type: 'Rating', user: 'Jane Smith', rating: 4, time: '4 hours ago' },
    ];

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const loadingText = "PAG TAGA HULAT MAN DAW"; // Loading message

    return (
        <>
            <Box sx={{ padding: '1rem', marginBottom: '20px', maxWidth: '100%' }}>
                <Typography level="h4" gutterBottom sx={{ display: { xs: "block", sm: 'none', md: 'none', lg: 'none' } }}>
                    Welcome back, {session.user.firstname}!
                </Typography>
                <Typography level="h3" gutterBottom sx={{ display: { xs: "none", sm: 'block', md: 'block', lg: 'none' } }}>
                    Welcome back, {session.user.firstname}!
                </Typography>
                <Typography level="h2" gutterBottom sx={{ display: { xs: "none", sm: 'none', md: 'none', lg: 'block' } }}>
                    Welcome back, {session.user.firstname}!     
                </Typography>
                <Typography>
                    Dashboard Overview
                </Typography>
            </Box>

            {/* Grid Section */}
            <Grid container spacing={2}>
                {PaperOverview.map((item, index) => (
                    <Grid item xs={6} lg={3} key={index}>
                        <Paper elevation={2} sx={{ padding: '1.5rem', textAlign: 'center' }}>
                            <Typography level="h6">{item.title}</Typography>
                            <Typography level="h4">{item.quantity}</Typography>
                        </Paper>
                    </Grid>
                ))}

                {/* Table for Recent Reports with Fixed Height */}
                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '420px' }}>
                        <Typography level="h3" gutterBottom>
                            Recent Items
                        </Typography>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((report, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Chip label={report.finder ? "Found" : "Lost"} color={report.finder ? "success" : "error"} />
                                            </TableCell>
                                            <TableCell>{report.name}</TableCell>
                                            <TableCell>{report.status}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                        <TablePagination
                            component="div"
                            count={items.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                        />
                    </Paper>
                </Grid>

                {/* Recent Activity and Quick Actions */}
                <Grid item xs={12} lg={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Updates Section */}
                        <Paper elevation={2} sx={{ padding: '1rem', maxWidth: '100%', height: '18.5rem', overflowY: 'auto' }}>
                            <Typography level="h3" gutterBottom sx={{ marginBottom: '1rem' }}>
                                Updates
                            </Typography>
                            {updates.map((update, index) => (
                                <Box key={index} sx={{ marginBottom: '1rem' }}>
                                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                                        {update.type === 'Lost' && <Chip label="Lost" color="error" sx={{ marginRight: '8px' }} />}
                                        {update.type === 'Found' && <Chip label="Found" color="success" sx={{ marginRight: '8px' }} />}
                                        {update.type === 'Badge' && <Chip label="Badge" color="info" sx={{ marginRight: '8px' }} />}
                                        {update.type === 'Rating' && <Chip label="Rating" color="warning" sx={{ marginRight: '8px' }} />}

                                        {update.type === 'Badge' && (
                                            <>
                                                You received a {update.badge} badge <Typography variant="body2" sx={{ marginLeft: '4px' }}>({update.time})</Typography>
                                            </>
                                        )}
                                        {update.type === 'Rating' && (
                                            <>
                                                You received a rating of {update.rating} stars <Typography variant="body2" sx={{ marginLeft: '4px' }}>({update.time})</Typography>
                                            </>
                                        )}
                                        {update.type === 'Lost' || update.type === 'Found' ? (
                                            <>
                                                {update.item} <Typography variant="body2" sx={{ marginLeft: '4px' }}>({update.time})</Typography>
                                            </>
                                        ) : null}
                                    </Typography>
                                    <Divider sx={{ margin: '8px 0' }} />
                                </Box>
                            ))}
                        </Paper>

                        {/* Quick Actions Section */}
                        <Paper elevation={2} sx={{ padding: '1rem', maxWidth: '100%' }}>
                            <Typography level="h3" gutterBottom>
                                Quick Actions
                            </Typography>
                            <Button sx={{ marginRight: '10px' }} onClick={() => router.push('/my-items/report-found-item')}>
                                Report Found Item
                            </Button>
                            <Button color="danger" onClick={() => router.push('/my-items/report-lost-item')}>
                                Report Lost Item
                            </Button>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </>
    );
};

export default UserDashboard;
