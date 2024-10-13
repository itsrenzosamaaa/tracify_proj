'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { Box } from '@mui/joy';
import ViewUsers from '@/app/components/ViewUsers';

const UsersPage = () => {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles');
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

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
                <ViewUsers users={users} roles={roles} fetchUsers={fetchUsers} session={session} />
            </Box>
        </>
    )
}

export default UsersPage