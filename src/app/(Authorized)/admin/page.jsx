'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import ViewAdminUsers from '@/app/components/ViewAdminUsers';

const UsersPage = () => {
    const { data: session, status } = useSession();
    const [adminUsers, setAdminUsers] = useState([]);
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

    const fetchAdminUsers = async () => {
        try {
            const response = await fetch('/api/admin');
            const data = await response.json();
            setAdminUsers(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchAdminUsers();
        fetchRoles();
    }, []);

    if (status === 'loading') {
        return null;
    }

    return (
        <>
            <ViewAdminUsers users={adminUsers} roles={roles} fetchAdminUsers={fetchAdminUsers} session={session} />
        </>
    )
}

export default UsersPage