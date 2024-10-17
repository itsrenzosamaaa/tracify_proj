'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ViewUserProfile from '@/app/components/ViewUserProfile';
import { Typography } from '@mui/joy';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState(null);
    const [foundItems, setFoundItems] = useState([]);
    const [lostItems, setLostItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            setLoading(true); // Start loading before fetch
            fetchData(session.user.id);
            fetchItems();
        }
    }, [session?.user?.id, status]);

    // Fetch user profile data
    const fetchData = async (accountId) => {
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
        } finally {
            setLoading(false); // Loading stops after profile fetch
        }
    };

    // Fetch found and lost items
    const fetchItems = async () => {
        try {
            const response = await fetch('/api/items');
            const data = await response.json();
            if (response.ok) {
                const filteredFoundItems = data.filter(item => item.isFoundItem);
                const filteredLostItems = data.filter(item => !item.isFoundItem);
                setFoundItems(filteredFoundItems);
                setLostItems(filteredLostItems);
            } else {
                console.error('Failed to fetch item data:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch item data:', error);
        }
    };

    // Fetch role after profile is loaded
    useEffect(() => {
        if (profile?.role) {
            fetchRole(profile.role);
        }
    }, [profile]);

    // Fetch the user's role
    const fetchRole = async (roleId) => {
        try {
            const response = await fetch(`/api/roles/${roleId}`);
            const data = await response.json();
            if (response.ok) {
                setRole(data);
            } else {
                console.error('Failed to fetch role data:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch role data:', error);
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>; // Show loading state
    }

    if (!profile) {
        return <Typography>User not found.</Typography>; // Show error or empty state
    }

    return (
        <>
            <ViewUserProfile profile={profile} role={role} foundItems={foundItems} lostItems={lostItems} />
        </>
    );
}

export default ProfilePage;
