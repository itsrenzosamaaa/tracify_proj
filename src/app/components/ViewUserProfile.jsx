'use client';

import React from 'react';
import { Grid, Breadcrumbs, Link, Typography } from '@mui/joy';
import { Box } from '@mui/material';
import AvatarWithName from './Profile/AvatarWithName';
import Bio from './Profile/Bio';
import ProgBadgeDisplay from './Profile/ProgBadgeDisplay';
import RecentRatingsFromUser from './Profile/RecentRatingsFromUser';
import RecentItems from './Profile/RecentItems';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';

const ViewUserProfile = ({ profile, role, foundItems, lostItems }) => {
    return (
        <>
            <TitleBreadcrumbs title="Profile" text="Profile" />
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
