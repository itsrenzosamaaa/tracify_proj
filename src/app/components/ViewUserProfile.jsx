'use client';

import React from 'react';
import { Grid, Breadcrumbs, Link, Typography } from '@mui/joy';
import { Box } from '@mui/material';
import AvatarWithName from './Profile/AvatarWithName';
import Bio from './Profile/Bio';
import ProgBadgeDisplay from './Profile/ProgBadgeDisplay';
import RecentRatingsFromUser from './Profile/RecentRatingsFromUser';
import RecentItems from './Profile/RecentItems';

const ViewUserProfile = ({ profile, role, foundItems, lostItems }) => {
    return (
        <>
            <Box sx={{ marginBottom: '1rem' }}>
                <Typography level="h5" letterSpacing={2} sx={{ fontSize: '24px', fontWeight: 'bold', mt: 5 }}>
                    Profile
                </Typography>
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: { xs: '14px', sm: '15px', md: '15px' } }}>
                        <Link letterSpacing={2} underline="hover" color="inherit" href="/dashboard">
                            Home
                        </Link>
                        <Typography letterSpacing={2} color="text.primary" sx={{ fontSize: { xs: '14px', sm: '15px', md: '15px' } }}>Profile</Typography>
                    </Breadcrumbs>
                </Grid>
            </Box>
            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <AvatarWithName role={role} user={profile} />
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Bio user={profile} />
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <ProgBadgeDisplay user={profile} />
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
        </>
    );
};

export default ViewUserProfile;
