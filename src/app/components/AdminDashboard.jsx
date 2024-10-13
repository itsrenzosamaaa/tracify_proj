'use client';

import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import { Button } from '@mui/joy';
import { BarChart, Notifications, Settings, Logout, Add } from "@mui/icons-material";
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const AdminDashboard = () => {
    const [isClient, setIsClient] = useState(false);

    // Make sure to only render on the client
    useEffect(() => {
        setIsClient(true);
    }, []);

    const chartData = {
        series: [
            {
                name: 'Items',
                data: [100, 200, 300, 250, 500, 400, 600]
            }
        ],
        options: {
            chart: {
                type: 'line',
                height: 350
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
            },
            stroke: {
                curve: 'smooth'
            },
            title: {
                text: 'Monthly Items Reports',
                align: 'left'
            },
            yaxis: {
                title: {
                    text: 'Items'
                }
            }
        }
    };

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Users</Typography>
                            <Typography variant="h4">3000</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Active Officers</Typography>
                            <Typography variant="h4">50</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Items Processed</Typography>
                            <Typography variant="h4">1200</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">System Logs</Typography>
                            <Typography variant="h4">150</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* User & Item Trends Chart */}
            {isClient && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Item Reports Over Time</Typography>
                    <Card>
                        <CardContent>
                            <Chart options={chartData.options} series={chartData.series} type="line" height={350} />
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Recent System Logs */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Recent System Logs</Typography>
                <Card>
                    <CardContent>
                        <Typography>System upgraded by John Doe at 10:30 AM.</Typography>
                        <Typography>User Mary Smith added a new officer at 9:00 AM.</Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button startDecorator={<Add />}>Add New User</Button>
                <Button startDecorator={<Settings />}>System Settings</Button>
                <Button color="warning">Generate Reports</Button>
            </Box>
        </>
    );
};

export default AdminDashboard;
