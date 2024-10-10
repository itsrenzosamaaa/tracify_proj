'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Breadcrumbs, Link, Typography } from '@mui/joy';
import { Paper } from '@mui/material';
import { useSession } from 'next-auth/react';
import AvatarWithName from '@/app/office/components/Profile/Papers/AvatarWithName';
import Bio from '@/app/office/components/Profile/Papers/Bio';
import ProgBadgeDisplay from '@/app/office/components/Profile/Papers/ProgBadgeDisplay';
import PersonalInfo from '@/app/office/components/Profile/Papers/PersonalInfo';
import SchoolInfo from '@/app/office/components/Profile/Papers/SchoolInfo';
import RecentRatingsFromUser from '@/app/office/components/Profile/Tables/RecentRatingsFromUser';
import RecentItems from '@/app/office/components/Profile/Tables/RecentItems';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [foundItems, setFoundItems] = useState([]);
    const [lostItems, setLostItems] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.roleData.accountId) {
            setLoading(true);
            fetchData(session.user.roleData.accountId);
            fetchItems(session.user.roleData.accountId)
            setLoading(false);
        }
    }, [session?.user?.roleData.accountId, status]);

    const fetchData = async (accountId) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/user/${accountId}`);
            const data = await response.json();
            if (response.ok) {
                setProfile(data);
            } else {
                console.error('Failed to fetch user data:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchItems = async (accountId) => {
        try {
            const response = await fetch('/api/items');
            const data = await response.json();
            if (response.ok) {
                const filteredFoundItems = data.filter(item => item.isFoundItem && item.finder === accountId);
                const filteredLostItems = data.filter(item => !item.isFoundItem && item.owner === accountId);
                setFoundItems(filteredFoundItems);
                setLostItems(filteredLostItems);
            } else {
                console.error('Failed to fetch item data:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch item data:', error);
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>; // Show loading state
    }

    if (!profile) {
        return <Typography>User not found.</Typography>; // Show error or empty state
    }

    return (
        <Box
            sx={{
                marginTop: '60px',
                marginLeft: { xs: '0px', lg: '250px' },
                padding: '20px',
                transition: 'margin-left 0.3s ease',
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Grid item xs={12} lg={6}>
                    <h2>Profile</h2>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Breadcrumbs aria-label="breadcrumbs">
                        <Link color="neutral" href="/user/dashboard">
                            Home
                        </Link>
                        <Typography>Profile</Typography>
                    </Breadcrumbs>
                </Grid>
            </Paper>
            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                <Grid item xs={12} lg={3}>
                    <AvatarWithName user={profile} />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Bio user={profile} />
                </Grid>
                <Grid item xs={12} lg={3}>
                    <ProgBadgeDisplay user={profile} />
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                <Grid item xs={12} lg={6}>
                    <PersonalInfo user={profile} session={session} />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <SchoolInfo user={profile} />
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                <Grid item xs={12} lg={6}>
                    <RecentItems items={foundItems} name="Found" />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <RecentItems items={lostItems} name="Lost" />
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                <Grid item lg={12}>
                    <RecentRatingsFromUser />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
