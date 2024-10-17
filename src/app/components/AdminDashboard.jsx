'use client';

import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent } from "@mui/material";
import { Typography } from '@mui/joy';
import { BarChart, Notifications, Settings, Logout, Add } from "@mui/icons-material";
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const AdminDashboard = ({ session }) => {
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

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography level="h6">Total Users</Typography>
                            <Typography level="h4">3000</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography level="h6">Items Monitored</Typography>
                            <Typography level="h4">50</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography level="h6">Items Resolved</Typography>
                            <Typography level="h4">1200</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography level="h6">System Logs</Typography>
                            <Typography level="h4">150</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* User & Item Trends Chart */}
            {isClient && (
                <Box sx={{ mt: 4 }}>
                    <Typography level="h6" gutterBottom>Item Reports Over Time</Typography>
                    <Card>
                        <CardContent>
                            <Chart options={chartData.options} series={chartData.series} type="line" height={350} />
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Recent System Logs */}
            <Box sx={{ mt: 4 }}>
                <Typography level="h6" gutterBottom>Recent System Logs</Typography>
                <Card>
                    <CardContent>
                        <Typography>System upgraded by John Doe at 10:30 AM.</Typography>
                        <Typography>User Mary Smith added a new officer at 9:00 AM.</Typography>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
};

export default AdminDashboard;
