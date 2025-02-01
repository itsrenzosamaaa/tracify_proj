'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { Box } from '@mui/joy';
import ViewLocations from '@/app/components/ViewLocations';

const LocationsPage = () => {
    const { data: session, status } = useSession();
    const [locations, setLocations] = useState();

    const fetchLocations = async () => {
        try {
            const response = await fetch('/api/location');
            const data = await response.json();
            setLocations(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchLocations();
    }, [])

    if (status === 'loading') {
        return null;
    }

    return (
        <>
            <ViewLocations locations={locations} session={session} refreshData={fetchLocations} />
        </>
    )
}

export default LocationsPage