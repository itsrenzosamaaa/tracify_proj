'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    Grid,
    Button,
    Box,
} from '@mui/joy';
import AvatarWithName from './Profile/AvatarWithName';
import Badges from './Profile/Badges';
import ProgBadgeDisplay from './Profile/ProgBadgeDisplay';
import RecentRatingsFromUser from './Profile/RecentRatingsFromUser';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';

const ViewUserProfile = ({ profile, items, ratings, refreshData, session, setOpenSnackbar }) => {
    const foundItems = items.filter(finder => finder.item.isFoundItem);

    return (
        <>
            <TitleBreadcrumbs title="Profile" text="Profile" />

            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                <Grid item xs={12} md={4}>
                    <AvatarWithName profile={profile} session={session} refreshData={refreshData} setOpenSnackbar={setOpenSnackbar} />
                </Grid>
                <Grid item xs={6} md={4}>
                    <Badges user={profile} />
                </Grid>
                <Grid item xs={6} md={4}>
                    <ProgBadgeDisplay user={profile} items={foundItems} />
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                <Grid item xs={12} lg={12}>
                    <RecentRatingsFromUser ratings={ratings} />
                </Grid>
            </Grid>
        </>
    );
};

export default ViewUserProfile;
