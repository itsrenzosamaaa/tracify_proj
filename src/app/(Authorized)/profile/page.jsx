'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ViewUserProfile from '@/app/components/ViewUserProfile';
import { Typography } from '@mui/joy';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();

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
            const response = await fetch(`/api/student-users/${accountId}`);
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

    // Fetch found and lost items
    // const fetchItems = async () => {
    //     try {
    //         const response = await fetch('/api/items');
    //         const data = await response.json();
    //         if (response.ok) {
    //             const filteredFoundItems = data.filter(item => item.isFoundItem);
    //             const filteredLostItems = data.filter(item => !item.isFoundItem);
    //             setFoundItems(filteredFoundItems);
    //             setLostItems(filteredLostItems);
    //         } else {
    //             console.error('Failed to fetch item data:', data.message);
    //         }
    //     } catch (error) {
    //         console.error('Failed to fetch item data:', error);
    //     }
    // };

    // Fetch role after profile is loaded

    if (loading) {
        return <Typography>Loading...</Typography>; // Show loading state
    }

    if (!profile) {
        return <Typography>User not found.</Typography>; // Show error or empty state
    }

    return (
        <>
            <ViewUserProfile profile={profile} />
        </>
    );
}

export default ProfilePage;
