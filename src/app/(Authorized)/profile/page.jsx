'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ViewUserProfile from '@/app/components/ViewUserProfile';
import { Typography, Snackbar } from '@mui/joy';
import Loading from '@/app/components/Loading';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [sentRatings, setSentRatings] = useState([]);
    const [receivedRatings, setReceivedRatings] = useState([]);
    const [badges, setBadges] = useState([]);
    const { data: session, status } = useSession();
    const [openSnackbar, setOpenSnackbar] = useState(null);
    const [message, setMessage] = useState('');

    console.log(items)

    useEffect(() => {
        // Fetch student data if authenticated and session contains user id
        if (status === 'authenticated' && session?.user?.id) {
            fetchData(session.user.id);
            fetchItems(session.user.id);
            fetchRatings(session?.user?.id)
            fetchBadges();
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

    const fetchItems = async (accountId) => {
        try {
            const response = await fetch(`/api/items/${accountId}`);
            const data = await response.json();
            if (response.ok) {
                setItems(data)
            } else {
                console.error('Failed to fetch item data:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch item data:', error);
        }
    };

    const fetchBadges = async () => {
        try {
            const response = await fetch('/api/badge');
            const data = await response.json();
            if (response.ok) {
                setBadges(data)
            } else {
                console.error('Failed to fetch item data:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch item data:', error);
        }
    };

    const fetchRatings = async (accountId) => {
        try {
            const receivedResponse = await fetch(`/api/ratings/receiver/${accountId}`)
            const receivedData = await receivedResponse.json();
            const sentResponse = await fetch(`/api/ratings/sender/${accountId}`)
            const sentData = await sentResponse.json();
            if (receivedResponse.ok && sentResponse.ok) {
                const filteredReceivedRatings = receivedData.filter(rating => rating?.done_review)
                const filteredSentRatings = sentData.filter(rating => rating?.done_review)
                setReceivedRatings(filteredReceivedRatings);
                setSentRatings(filteredSentRatings)
            } else {
                console.error('Failed to fetch ratings:', data.message)
            }
        } catch (error) {
            console.error('Failed to fetch ratings:', error);
        }
    }

    // Fetch role after profile is loaded

    if (loading) {
        return <Loading />; // Show loading state
    }

    if (!profile) {
        return <Typography>User not found.</Typography>; // Show error or empty state
    }

    return (
        <>
            <ViewUserProfile profile={profile} items={items} receivedRatings={receivedRatings} sentRatings={sentRatings} refreshData={fetchData} session={session} setOpenSnackbar={setOpenSnackbar} setMessage={setMessage} badges={badges} />
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
