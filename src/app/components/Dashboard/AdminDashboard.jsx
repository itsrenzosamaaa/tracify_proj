'use client';

import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent } from "@mui/material";
import { Typography, Button } from '@mui/joy';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import TopStudentsEarnedBadges from '../TopStudentsEarnedBadges';
import PublishFoundItem from '../Modal/PublishFoundItem';
import PublishLostItem from '../Modal/PublishLostItems';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const AdminDashboard = ({ session, users }) => {
    const [isClient, setIsClient] = useState(false);
    const [openFound, setOpenFound] = useState(false);
    const [openLost, setOpenLost] = useState(false);

    console.log(session)

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
            <Grid container spacing={2}>
                {/* Welcome Message */}
                <Grid item xs={12}>
                    <Box sx={{ padding: '1rem', maxWidth: '100%' }}>
                        <Typography
                            level="h4"
                            gutterBottom
                            sx={{ display: { xs: "block", sm: "none", md: "none", lg: "none" } }}
                        >
                            Welcome back, {session.user.firstname}!
                        </Typography>
                        <Typography
                            level="h3"
                            gutterBottom
                            sx={{ display: { xs: "none", sm: "block", md: "block", lg: "none" } }}
                        >
                            Welcome back, {session.user.firstname}!
                        </Typography>
                        <Typography
                            level="h2"
                            gutterBottom
                            sx={{ display: { xs: "none", sm: "none", md: "none", lg: "block" } }}
                        >
                            Welcome back, {session.user.firstname}!
                        </Typography>
                        <Typography>Dashboard Overview</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            {
                                session.user.permissions.publishItems &&
                                <>
                                    <Button onClick={() => setOpenFound(true)}>Publish Found Item</Button>
                                    <PublishFoundItem open={openFound} onClose={() => setOpenFound(false)} inDashboard={true} />
                                    <Button color="danger" onClick={() => setOpenLost(true)}>Publish Lost Item</Button>
                                    <PublishLostItem open={openLost} onClose={() => setOpenLost(false)} inDashboard={true} />
                                </>
                            }
                            {(session.user.permissions.viewBadges && session.user.permissions.addBadge) && <Button>Add Badge</Button>}
                            {(session.user.permissions.viewRoles && session.user.permissions.addRole) && <Button>Add Role</Button>}
                        </Box>
                    </Box>
                </Grid>

                {/* Top Stats Cards */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        {
                            session.user.permissions.viewStudentsList &&
                            <Grid item xs={12} sm={6} md={3}>
                                <Card
                                    component={Link}
                                    href="/users"
                                    sx={{
                                        textDecoration: 'none',
                                        display: 'block',
                                        '&:hover': {
                                            boxShadow: 6, // Adds a hover effect for better feedback
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Typography level="h6" gutterBottom>
                                            Total Users
                                        </Typography>
                                        <Typography level="h4">{users.length}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        }
                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                component={Link}
                                href="/users"
                                sx={{
                                    textDecoration: 'none',
                                    display: 'block',
                                    '&:hover': {
                                        boxShadow: 6, // Adds a hover effect for better feedback
                                    },
                                }}
                            >
                                <CardContent>
                                    <Typography level="h6" gutterBottom>Found Items Monitored</Typography>
                                    <Typography level="h4">50</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                component={Link}
                                href="/users"
                                sx={{
                                    textDecoration: 'none',
                                    display: 'block',
                                    '&:hover': {
                                        boxShadow: 6, // Adds a hover effect for better feedback
                                    },
                                }}
                            >
                                <CardContent>
                                    <Typography level="h6" gutterBottom>Lost Items Monitored</Typography>
                                    <Typography level="h4">1200</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                component={Link}
                                href="/users"
                                sx={{
                                    textDecoration: 'none',
                                    display: 'block',
                                    '&:hover': {
                                        boxShadow: 6, // Adds a hover effect for better feedback
                                    },
                                }}
                            >
                                <CardContent>
                                    <Typography level="h6" gutterBottom>Items Resolved</Typography>
                                    <Typography level="h4">150</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Item Reports Over Time */}
                <Grid item xs={12} lg={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography level="h3" gutterBottom>
                        Item Reports Over Time
                    </Typography>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            {isClient && (
                                <Chart
                                    options={chartData.options}
                                    series={chartData.series}
                                    type="line"
                                    height={335}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Students */}
                <Grid item xs={12} lg={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <TopStudentsEarnedBadges users={users} />
                </Grid>


                <Grid item xs={12} lg={12}>
                    <Typography level="h6" gutterBottom>
                        Recent System Logs
                    </Typography>
                    <Card>
                        <CardContent>
                            <Typography>System upgraded by John Doe at 10:30 AM.</Typography>
                            <Typography>User Mary Smith added a new officer at 9:00 AM.</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};

export default AdminDashboard;
