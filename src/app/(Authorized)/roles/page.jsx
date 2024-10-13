'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { Box } from '@mui/joy';
import ViewRoles from '@/app/components/ViewRoles';

const RolesPage = () => {
    const { data: session, status } = useSession();
    const [roles, setRoles] = useState();

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch('/api/roles');
                const data = await response.json();
                setRoles(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchRoles();
    }, [])

    if (status === 'loading') {
        return null;
    }

    return (
        <>
            <Box
                sx={{
                    marginTop: '60px', // Ensure space for header
                    marginLeft: { xs: '0px', lg: '250px' }, // Shift content when sidebar is visible on large screens
                    padding: '20px',
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <ViewRoles roles={roles} session={session} />
            </Box>
        </>
    )
}

export default RolesPage