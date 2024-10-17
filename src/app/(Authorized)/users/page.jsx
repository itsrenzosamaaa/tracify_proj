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
            <ViewUsers users={users} roles={roles} fetchUsers={fetchUsers} session={session} />
        </>
    )
}

export default UsersPage