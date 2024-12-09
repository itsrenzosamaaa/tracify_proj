'use client';

import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Grid, Button, Table, List, ListItem } from "@mui/joy";
import { Paper, TableBody, TableCell, TableHead, TableRow, TablePagination, Chip, Card, CardContent, TableContainer, ListItemIcon, ListItemText } from "@mui/material";
import { useRouter } from "next/navigation";
import Loading from "../Loading";
import TopStudentsEarnedBadges from "../TopStudentsEarnedBadges";
import { Circle } from "@mui/icons-material";

const UserDashboard = ({ session, status, users }) => {
    const [userItems, setUserItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const fetchItems = async (accountId) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/items/${accountId}`);
            const data = await response.json();
            if (response.ok) {
                setUserItems(data);
            } else {
                console.error('Failed to fetch item data:', data.message);
                setError(data.message);
            }
        } catch (error) {
            console.error('Failed to fetch item data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            fetchItems(session.user.id);
        }
    }, [status, session?.user?.id]);

    const PaperOverview = useMemo(() => [
        { title: 'Total Found Items', quantity: userItems.filter(userItem => userItem.item.isFoundItem).length, description: 'Items reported as found by the user.' },
        { title: 'Total Lost Items', quantity: userItems.filter(userItem => !userItem.item.isFoundItem).length, description: 'Items reported as lost by the user.' },
        { title: 'Pending Requests', quantity: userItems.filter(userItem => userItem.item.status === 'Request').length, description: 'Requests currently being processed.' },
        { title: 'Resolved Cases', quantity: userItems.filter(userItem => userItem.item.status === 'Resolved' || userItem.item.status === 'Claimed').length, description: 'Cases that have been successfully resolved.' },
    ], [userItems]);

    if (loading) return <Loading />;

    if (error) return <Typography color="error">Error: {error}</Typography>;

    return (
        <>
            <Box sx={{ marginBottom: '20px', maxWidth: '100%' }}>
                <Typography level="h4" gutterBottom sx={{ display: { xs: "block", sm: 'none', md: 'none', lg: 'none' } }}>
                    Welcome back, {session.user.firstname}!
                </Typography>
                <Typography level="h3" gutterBottom sx={{ display: { xs: "none", sm: 'block', md: 'block', lg: 'none' } }}>
                    Welcome back, {session.user.firstname}!
                </Typography>
                <Typography level="h2" gutterBottom sx={{ display: { xs: "none", sm: 'none', md: 'none', lg: 'block' } }}>
                    Welcome back, {session.user.firstname}!
                </Typography>
                <Typography gutterBottom>
                    Dashboard Overview
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button size="small" onClick={() => router.push('/my-items/report-found-item')}>Report Found Item</Button>
                    <Button size="small" onClick={() => router.push('/my-items/report-lost-item')} color="danger">Report Lost Item</Button>
                </Box>
            </Box>

            {/* Grid Section */}
            <Grid container spacing={2}>
                {PaperOverview.map((item, index) => (
                    <Grid item xs={12} sm={6} lg={3} key={index}>
                        <Paper
                            elevation={3}
                            sx={{
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                borderRadius: '8px',
                                height: '120px', // Set shorter height
                                '&:hover': {
                                    backgroundColor: '#f7f7f7',
                                    transform: 'translateY(-2px)',
                                    transition: '0.2s ease-in-out',
                                },
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    color: '#555',
                                    marginBottom: '0.3rem',
                                    whiteSpace: 'nowrap', // Prevent wrapping
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {item.title}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '1.8rem',
                                    fontWeight: '700',
                                    color: '#1976d2',
                                    lineHeight: '1.2',
                                }}
                            >
                                {item.quantity}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.85rem',
                                    fontWeight: '400',
                                    color: '#888',
                                    marginTop: '0.5rem',
                                    lineHeight: '1.2',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2, // Clamp description to 2 lines
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {item.description}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
                <Grid item xs={12} md={6}>
                    <Typography level="h3" gutterBottom>
                        Our Mission
                    </Typography>
                    <Paper sx={{ padding: '1rem', height: '250px' }}>
                        <Box>
                            <Typography level="title-md">
                                The Lewis College is committed to:
                            </Typography>
                            <List sx={{ paddingLeft: '1.5rem' }}> {/* Adjust padding to position bullets correctly */}
                                <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}> {/* Align text and bullet */}
                                    <ListItemIcon sx={{ minWidth: 'auto', marginTop: 1.5 }}> {/* Adjust position of icon */}
                                        <Circle sx={{ fontSize: '8px' }} /> {/* Bullet size and color */}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Serving the people of God through a value-focused educational environment."
                                    />
                                </ListItem>
                                <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <ListItemIcon sx={{ minWidth: 'auto', marginTop: 1.5 }}>
                                        <Circle sx={{ fontSize: '8px' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Developing entrepreneurial leadership and information technology competencies."
                                    />
                                </ListItem>
                                <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <ListItemIcon sx={{ minWidth: 'auto', marginTop: 1.5 }}>
                                        <Circle sx={{ fontSize: '8px' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Forming students to be well-rounded, skilled, and professional men and women."
                                    />
                                </ListItem>
                            </List>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography level="h3" gutterBottom>
                        Our Vision
                    </Typography>
                    <Paper sx={{ padding: '1rem', height: '250px' }}>
                        <Box>
                            <Typography level="body-lg" fontWeight={400} sx={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                                The Lewis College is an education community and a Center of Excellence founded on the Christian Values of Faith, Service, and Personhood.
                            </Typography>
                            <Typography level="body-lg" fontWeight={400} sx={{ lineHeight: 1.6 }}>
                                It exists to provide the Bicol Region with high quality and low-cost education that is accessible to all students aspiring to be productive members of society, propelling them as catalysts for progress in the region.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <TopStudentsEarnedBadges users={users} />
                </Grid>
            </Grid>
        </>
    );
};

export default UserDashboard;
