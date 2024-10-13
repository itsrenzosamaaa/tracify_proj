'use client'

import React from "react";
import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";

const OfficeDashboard = () => {

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Items Found</Typography>
                            <Typography variant="h4">120</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Items Claimed</Typography>
                            <Typography variant="h4">80</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Pending Validations</Typography>
                            <Typography variant="h4">20</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Reports</Typography>
                            <Typography variant="h4">5</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Weekly Activity</Typography>
                {/* <ApexChart options={chartData.options} series={chartData.series} type="bar" height={350} /> */}
            </Box>

            {/* Recent Activity */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                <Card>
                    <CardContent>
                        <Typography>John Doe validated an item at 2:00 PM.</Typography>
                        <Typography>Anna Smith added a lost item report at 1:30 PM.</Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="contained" color="primary">Add Item</Button>
                <Button variant="outlined">Generate Report</Button>
                <Button variant="contained" color="secondary">Validate Items</Button>
            </Box>
        </>
    );
};

export default OfficeDashboard;
