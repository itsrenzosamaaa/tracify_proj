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
import ChangeProfilePicture from './Modal/ChangeProfilePicture';
import ChangeUsername from './Modal/ChangeUsername';

const ViewUserProfile = ({ profile, items, ratings, refreshData, session, setOpenSnackbar }) => {
    const foundItems = items.filter(finder => finder.item.isFoundItem);
    const [openModal, setOpenModal] = useState(false);
    const [openUsernameModal, setOpenUsernameModal] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [image, setImage] = useState(profile.profile_picture || null);
    const [loading, setLoading] = useState(false);

    return (
        <>
            <TitleBreadcrumbs title="Profile" text="Profile" />
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => setOpenModal(true)} disabled={loading}>
                    Change Profile Picture
                </Button>
                <Button onClick={() => setOpenUsernameModal(true)} disabled={loading}>
                    Change Username
                </Button>
                <Button onClick={() => setOpenPasswordModal(true)} disabled={loading}>
                    Change Password
                </Button>
            </Box>

            <ChangeProfilePicture loading={loading} setImage={setImage} setLoading={setLoading} refreshData={refreshData} session={session} setOpenSnackbar={setOpenSnackbar} setOpenModal={setOpenModal} openModal={openModal} />
            <ChangeUsername session={session} profile={profile} openUsernameModal={openUsernameModal} setOpenUsernameModal={setOpenUsernameModal} refreshData={refreshData} setOpenSnackbar={setOpenSnackbar}  />

            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                <Grid item xs={12} md={6} lg={4}>
                    <AvatarWithName user={profile} image={image} />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <Badges user={profile} />
                </Grid>
                <Grid item xs={12} lg={4}>
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
