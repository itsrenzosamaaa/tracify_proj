'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Box, Grid, Card, CardContent, Paper, useTheme, useMediaQuery } from "@mui/material";
import { Typography } from '@mui/joy';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import TopStudentsEarnedBadges from '../TopStudentsEarnedBadges';
import PublishFoundItem from '../Modal/PublishFoundItem';
import PublishLostItem from '../Modal/PublishLostItems';
import { MoreHoriz } from '@mui/icons-material';

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
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

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
                    </Box>
                </Grid>

                {/* Top Stats Cards */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        {
                            session.user.permissions.manageRequestReportedFoundItems &&
                            <Grid item xs={12} md={4}>
                                <Paper
                                    component={Link}
                                    href='/found-items'
                                    elevation={3}
                                    sx={{
                                        backgroundColor: '#1976d2', // Blue background for the card
                                        color: '#fff',
                                        textDecoration: 'none',
                                        padding: '1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        borderRadius: '8px',
                                        '&:hover': {
                                            backgroundColor: '#1565c0', // Darker blue on hover
                                            transform: 'translateY(-4px)',
                                            transition: '0.3s ease-in-out',
                                        },
                                    }}
                                >
                                    <Typography
                                        level={isXs ? 'title-md' : 'title-lg'}
                                        sx={{
                                            color: '#fff',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            paddingTop: 2,
                                        }}
                                    >
                                        Found Items
                                    </Typography>
                                    <Typography
                                        level={isXs ? 'body-xs' : 'body-sm'}
                                        sx={{
                                            fontWeight: '400',
                                            color: '#fff',
                                            lineHeight: '1.4',
                                            flexGrow: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            paddingBottom: 2,
                                        }}
                                    >
                                        View your monitored found items here
                                    </Typography>
                                    <Box
                                        sx={{
                                            marginTop: 'auto', // Pushes the footer to the bottom
                                            paddingTop: 2,
                                            display: 'flex',
                                            justifyContent: 'center', // Centers the content horizontally
                                            alignItems: 'center', // Centers the content vertically if needed
                                            width: '100%', // Ensures the Box takes up the full width of the Paper
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                color: '#ddd',
                                            }}
                                        >
                                            More info &rarr;
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        }
                        {
                            session.user.permissions.manageRequestReportedLostItems &&
                            <Grid item xs={12} md={4}>
                                <Paper
                                    component={Link}
                                    href='/lost-items'
                                    elevation={3}
                                    sx={{
                                        backgroundColor: '#ff1744', // Blue background for the card
                                        color: '#fff',
                                        textDecoration: 'none',
                                        padding: '1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        borderRadius: '8px',
                                        '&:hover': {
                                            backgroundColor: '#d50000', // Darker blue on hover
                                            transform: 'translateY(-4px)',
                                            transition: '0.3s ease-in-out',
                                        },
                                    }}
                                >
                                    <Typography
                                        level={isXs ? 'title-md' : 'title-lg'}
                                        sx={{
                                            color: '#fff',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            paddingTop: 2,
                                        }}
                                    >
                                        Lost Items
                                    </Typography>
                                    <Typography
                                        level={isXs ? 'body-xs' : 'body-sm'}
                                        sx={{
                                            fontWeight: '400',
                                            color: '#fff',
                                            lineHeight: '1.4',
                                            flexGrow: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            paddingBottom: 2,
                                        }}
                                    >
                                        View your monitored lost items here
                                    </Typography>
                                    <Box
                                        sx={{
                                            marginTop: 'auto', // Pushes the footer to the bottom
                                            paddingTop: 2,
                                            display: 'flex',
                                            justifyContent: 'center', // Centers the content horizontally
                                            alignItems: 'center', // Centers the content vertically if needed
                                            width: '100%', // Ensures the Box takes up the full width of the Paper
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                color: '#ddd',
                                            }}
                                        >
                                            More info &rarr;
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        }
                        {
                            session.user.permissions.manageRequestItemRetrieval &&
                            <Grid item xs={12} md={4}>
                                <Paper
                                    component={Link}
                                    href='/item-retrieval'
                                    elevation={3}
                                    sx={{
                                        backgroundColor: '#2e7d32', // Blue background for the card
                                        color: '#fff',
                                        textDecoration: 'none',
                                        padding: '1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        borderRadius: '8px',
                                        '&:hover': {
                                            backgroundColor: '#1b5e20', // Darker blue on hover
                                            transform: 'translateY(-4px)',
                                            transition: '0.3s ease-in-out',
                                        },
                                    }}
                                >
                                    <Typography
                                        level={isXs ? 'title-md' : 'title-lg'}
                                        sx={{
                                            color: '#fff',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            paddingTop: 2,
                                        }}
                                    >
                                        Resolved Items
                                    </Typography>
                                    <Typography
                                        level={isXs ? 'body-xs' : 'body-sm'}
                                        sx={{
                                            fontWeight: '400',
                                            color: '#fff',
                                            lineHeight: '1.4',
                                            flexGrow: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            paddingBottom: 2,
                                        }}
                                    >
                                        View your resolved items here
                                    </Typography>
                                    <Box
                                        sx={{
                                            marginTop: 'auto', // Pushes the footer to the bottom
                                            paddingTop: 2,
                                            display: 'flex',
                                            justifyContent: 'center', // Centers the content horizontally
                                            alignItems: 'center', // Centers the content vertically if needed
                                            width: '100%', // Ensures the Box takes up the full width of the Paper
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                color: '#ddd',
                                            }}
                                        >
                                            More info &rarr;
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        }
                        {
                            session.user.permissions.viewAdminsList &&
                            <Grid item xs={12} sm={6} md={4}>
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
                            <Grid item xs={12} sm={6} md={4}>
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
                            <Grid item xs={12} sm={6} md={4}>
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
