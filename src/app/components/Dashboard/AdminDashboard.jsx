'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
    const [foundItems, setFoundItems] = useState([]);
    const [lostItems, setLostItems] = useState([]);
    const [resolvedItems, setResolvedItems] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [roles, setRoles] = useState([]);
    const [badges, setBadges] = useState([]);
    const [chartData, setChartData] = useState({
        series: [],
        options: {
            chart: { type: 'line', height: 350 },
            xaxis: { categories: [] },
            stroke: { curve: 'smooth' },
            title: { text: 'Monthly Lost Items Reports', align: 'left' },
            yaxis: { title: { text: 'Number of Lost Items' } }
        }
    });

    console.log(session)

    const fetchFoundItems = useCallback(async () => {
        try {
            const response = await fetch('/api/found-items');
            const data = await response.json();
            setFoundItems(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchLostItems = useCallback(async () => {
        try {
            const response = await fetch('/api/lost-items');
            const data = await response.json();

            setLostItems(data);

            const categorizedData = categorizeItemsByMonth(data);
            const months = Object.keys(categorizedData);
            const itemCounts = Object.values(categorizedData);

            setChartData(prev => ({
                ...prev,
                series: [{ name: 'Lost Items', data: itemCounts }],
                options: { ...prev.options, xaxis: { categories: months } },
            }));
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchResolvedItems = useCallback(async () => {
        try {
            const response = await fetch('/api/match-items');
            const data = await response.json();
            const completedItems = data.filter(resolvedItem => resolvedItem.request_status === 'Completed');
            setResolvedItems(completedItems);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchAdmins = useCallback(async () => {
        try {
            const response = await fetch('/api/admin');
            const data = await response.json();
            setAdmins(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const response = await fetch('/api/roles');
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchBadges = useCallback(async () => {
        try {
            const response = await fetch('/api/badge');
            const data = await response.json();
            setBadges(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        setIsClient(true);
        fetchFoundItems();
        fetchLostItems();
        fetchResolvedItems();
        fetchAdmins();
        fetchRoles();
        fetchBadges();
    }, [fetchFoundItems, fetchLostItems, fetchResolvedItems, fetchAdmins, fetchRoles, fetchBadges]);


    const categorizeItemsByMonth = (items) => {
        // Initialize an object to hold counts per month
        const countsByMonth = {
            Jan: 0,
            Feb: 0,
            Mar: 0,
            Apr: 0,
            May: 0,
            Jun: 0,
            Jul: 0,
            Aug: 0,
            Sep: 0,
            Oct: 0,
            Nov: 0,
            Dec: 0
        };

        items.forEach(item => {
            const month = new Date(item.dateMissing).toLocaleString('en-US', { month: 'short' });
            countsByMonth[month] += 1; // Increment the count for the respective month
        });

        return countsByMonth;
    }

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
                                    <Button size="small" onClick={() => setOpenFound(true)}>Publish Found Item</Button>
                                    <PublishFoundItem open={openFound} onClose={() => setOpenFound(false)} inDashboard={true} />
                                    <Button size="small" color="danger" onClick={() => setOpenLost(true)}>Publish Lost Item</Button>
                                    <PublishLostItem open={openLost} onClose={() => setOpenLost(false)} inDashboard={true} />
                                </>
                            }
                            {(session.user.permissions.viewBadges && session.user.permissions.addBadge) && <Button size="small">Add Badge</Button>}
                            {(session.user.permissions.viewRoles && session.user.permissions.addRole) && <Button size="small">Add Role</Button>}
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
                        {
                            session.user.permissions.manageRequestReportedFoundItems &&
                            <Grid item xs={12} sm={6} md={3}>
                                <Card
                                    component={Link}
                                    href="/found-items"
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
                                        <Typography level="h4">{foundItems.length}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        }
                        {
                            session.user.permissions.manageRequestReportedLostItems &&
                            <Grid item xs={12} sm={6} md={3}>
                                <Card
                                    component={Link}
                                    href="/lost-items"
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
                                        <Typography level="h4">{lostItems.length}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        }
                        {
                            session.user.permissions.manageRequestItemRetrieval &&
                            <Grid item xs={12} sm={6} md={3}>
                                <Card
                                    component={Link}
                                    href="/item-retrieval"
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
                                        <Typography level="h4">{resolvedItems.length}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        }
                        {
                            session.user.permissions.viewAdminsList &&
                            <Grid item xs={12} sm={6} md={3}>
                                <Card
                                    component={Link}
                                    href="/admin"
                                    sx={{
                                        textDecoration: 'none',
                                        display: 'block',
                                        '&:hover': {
                                            boxShadow: 6, // Adds a hover effect for better feedback
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Typography level="h6" gutterBottom>Total Admins</Typography>
                                        <Typography level="h4">{admins.length}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        }
                        {
                            session.user.permissions.viewRoles &&
                            <Grid item xs={12} sm={6} md={3}>
                                <Card
                                    component={Link}
                                    href="/roles"
                                    sx={{
                                        textDecoration: 'none',
                                        display: 'block',
                                        '&:hover': {
                                            boxShadow: 6, // Adds a hover effect for better feedback
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Typography level="h6" gutterBottom>Roles Created</Typography>
                                        <Typography level="h4">{roles.length}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        }
                        {
                            session.user.permissions.viewBadges &&
                            <Grid item xs={12} sm={6} md={3}>
                                <Card
                                    component={Link}
                                    href="/badges"
                                    sx={{
                                        textDecoration: 'none',
                                        display: 'block',
                                        '&:hover': {
                                            boxShadow: 6, // Adds a hover effect for better feedback
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Typography level="h6" gutterBottom>Badges Created</Typography>
                                        <Typography level="h4">{badges.length}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        }
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
            </Grid>
        </>
    );
};

export default AdminDashboard;
