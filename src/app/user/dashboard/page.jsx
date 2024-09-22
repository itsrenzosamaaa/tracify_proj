'use client';

import React, { useState } from "react";
import { Box, Typography, Grid, Button, Table } from "@mui/joy";
import { Paper, TableBody, TableCell, TableHead, TableRow, TablePagination, Divider, Chip } from "@mui/material";
import { Star, StarBorder, Badge } from '@mui/icons-material';
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session, status } = useSession();

  const PaperOverview = [
    { title: 'Total Lost Items', quantity: 25 },
    { title: 'Total Found Items', quantity: 15 },
    { title: 'Pending Requests', quantity: 5 },
    { title: 'Resolved Cases', quantity: 10 },
  ];

  const recentItems = [
    { type: 'Lost', item: 'Blue Wallet', time: '2 hours ago' },
    { type: 'Found', item: 'Red Umbrella', time: '1 hour ago' },
    { type: 'Lost', item: 'Black Backpack', time: '3 hours ago' },
    { type: 'Lost', item: 'Green Hat', time: '4 hours ago' },
    { type: 'Found', item: 'Yellow Scarf', time: '5 hours ago' },
    { type: 'Lost', item: 'White Shoes', time: '6 hours ago' },
    { type: 'Found', item: 'Black Sunglasses', time: '7 hours ago' },
  ];

  const updates = [
    { type: 'Lost', item: 'Blue Wallet', time: '2 hours ago' },
    { type: 'Found', item: 'Red Umbrella', time: '1 hour ago' },
    { type: 'Badge', user: 'John Doe', badge: 'Gold', time: '3 hours ago' },
    { type: 'Rating', user: 'Jane Smith', rating: 4, time: '4 hours ago' },
  ];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
      <Box
        sx={{
          marginTop: "60px", // Ensure space for header
          marginLeft: { xs: "0px", lg: "250px" }, // Shift content when sidebar is visible on large screens
          padding: "20px",
          transition: "margin-left 0.3s ease",
        }}
      >
        {status === 'loading' ? loadingText : (
          <>
            {/* Welcome Section */}
            <Paper elevation={2} sx={{ padding: '1rem', marginBottom: '20px', maxWidth: '100%' }}>
              <Typography level="h2" gutterBottom>
                Welcome back, {session?.user?.firstname || 'User'}!
              </Typography>
              <Typography>
                You are logged in as {session?.user?.role || 'Role'}.
              </Typography>
            </Paper>

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
                    Recent Reports
                  </Typography>
                  <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Item</TableCell>
                          <TableCell>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((report, index) => (
                          <TableRow key={index}>
                            <TableCell>{report.type}</TableCell>
                            <TableCell>{report.item}</TableCell>
                            <TableCell>{report.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                  <TablePagination
                    component="div"
                    count={recentItems.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
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
                    <Button sx={{ marginRight: '10px' }}>
                      Report Lost Item
                    </Button>
                    <Button>
                      Report Found Item
                    </Button>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </>
  );
};

export default Dashboard;
