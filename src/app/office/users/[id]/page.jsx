'use client'

import { Typography, Box, Breadcrumbs, Link } from '@mui/joy';
import React, { useEffect, useState } from 'react'
import { Paper, Grid } from '@mui/material';
import AvatarWithName from '../../components/Profile/Papers/AvatarWithName';
import Bio from '../../components/Profile/Papers/Bio';
import ProgBadgeDisplay from '../../components/Profile/Papers/ProgBadgeDisplay';
import PersonalInfo from '../../components/Profile/Papers/PersonalInfo';
import SchoolInfo from '../../components/Profile/Papers/SchoolInfo';
import RecentFoundItems from '../../components/Profile/Tables/RecentFoundItems';
import RecentLostItems from '../../components/Profile/Tables/RecentLostItems';
import RecentRatingsFromUser from '../../components/Profile/Tables/RecentRatingsFromUser';
import { useSession } from 'next-auth/react';

const UserProfile = ({ params }) => {
    const { id } = params;
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/user/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setUser(data);
                } else {
                    console.error('Failed to fetch user data:', data.message);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUser();
    }, [id]);

    return (
        <>
            <Grid
                sx={{
                    marginTop: "60px", // Ensure space for header
                    marginLeft: { xs: "0px", lg: "250px" }, // Shift content when sidebar is visible on large screens
                    padding: "20px",
                    transition: "margin-left 0.3s ease",
                }}
            >
                {user && (
                    <>
                        <Paper
                            elevation={2}
                            sx={{
                                padding: "1rem",
                                marginBottom: "1rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Grid item xs={12} lg={6}>
                                <h2>Profile</h2>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Breadcrumbs aria-label="breadcrumbs">
                                    <Link color="neutral" href="/office/dashboard">
                                        Home
                                    </Link>
                                    <Link color="neutral" href="/office/users">
                                        Users
                                    </Link>
                                    <Typography>Profile</Typography>
                                </Breadcrumbs>
                            </Grid>
                        </Paper>
                        <Grid container spacing={2} sx={{ marginBottom: "1rem", }}>
                            <Grid item xs={12} lg={3}>
                                <AvatarWithName user={user} />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Bio user={user} />
                            </Grid>
                            <Grid item xs={12} lg={3}>
                                <ProgBadgeDisplay user={user} />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ marginBottom: "1rem", }}>
                            <Grid item xs={12} lg={6}>
                                <PersonalInfo user={user} />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <SchoolInfo user={user} />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ marginBottom: "1rem", }}>
                            <Grid item xs={12} lg={6}>
                                <RecentFoundItems />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <RecentLostItems />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ marginBottom: "1rem", }}>
                            <Grid item lg={12}>
                                <RecentRatingsFromUser />
                            </Grid>
                        </Grid>
                    </>
                )}
            </Grid>
        </>
    )
}

export default UserProfile