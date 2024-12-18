'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    Grid,
    Button,
    Box,
} from '@mui/joy';
import { Paper } from '@mui/material';
import AvatarWithName from './Profile/AvatarWithName';
import Badges from './Profile/Badges';
import ProgBadgeDisplay from './Profile/ProgBadgeDisplay';
import RecentRatingsFromUser from './Profile/RecentRatingsFromUser';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';

const ViewUserProfile = ({ profile, items, receivedRatings, sentRatings, refreshData, session, setOpenSnackbar, setMessage, badges }) => {
    const foundItems = items.filter(finder => finder.item.isFoundItem);

    return (
        <>
            <TitleBreadcrumbs title="Profile" text="Profile" />

            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                <Grid item xs={12} md={6}>
                    <AvatarWithName profile={profile} session={session} refreshData={refreshData} setOpenSnackbar={setOpenSnackbar} setMessage={setMessage} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Badges badges={badges} profile={profile} />
                </Grid>
                <Grid item xs={12}>
                    <RecentRatingsFromUser receivedRatings={receivedRatings} />
                </Grid>
            </Grid>
        </>
    );
};

export default ViewUserProfile;
