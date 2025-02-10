'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ViewUserProfile from '@/app/components/ViewUserProfile';
import { Typography, Snackbar } from '@mui/joy';
import Loading from '@/app/components/Loading';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { data: session, status, update } = useSession();
    const [openSnackbar, setOpenSnackbar] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch student data if authenticated and session contains user id
        if (status === 'authenticated' && session?.user?.id) {
            fetchData(session.user.id);
        }
    }, [session?.user?.id, status]);

    // Fetch user profile data
    const fetchData = async (accountId) => {
        try {
            setLoading(true); // Set loading to true before fetch
            const response = await fetch(`/api/users/${accountId}`);
            const data = await response.json();
            if (response.ok) {
                setProfile(data); // Set profile if the fetch was successful
            } else {
                console.error('Failed to fetch user data:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setLoading(false); // Set loading to false after fetch
        }
    };

    if (loading) {
        return <Loading />; // Show loading state
    }

    if (!profile) {
        return <Typography>User not found.</Typography>; // Show error or empty state
    }

    return (
        <>
            <ViewUserProfile update={update} profile={profile} refreshData={fetchData} session={session} setOpenSnackbar={setOpenSnackbar} setMessage={setMessage} />
            <Snackbar
                autoHideDuration={5000}
                open={openSnackbar}
                variant="solid"
                color={openSnackbar}
                onClose={(event, reason) => {
                    if (reason === 'clickaway') {
                        return;
                    }
                    setOpenSnackbar(null);
                }}
            >
                {message}
            </Snackbar>
        </>
    );
}

export default ProfilePage;
