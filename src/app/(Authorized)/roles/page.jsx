'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { Box } from '@mui/joy';
import ViewRoles from '@/app/components/ViewRoles';

const RolesPage = () => {
    const { data: session, status } = useSession();
    const [roles, setRoles] = useState();

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles');
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchRoles();
    }, [])

    if (status === 'loading') {
        return null;
    }

    return (
        <>
            <ViewRoles roles={roles} session={session} refreshData={fetchRoles} />
        </>
    )
}

export default RolesPage