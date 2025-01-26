'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import ViewAdminUsers from '@/app/components/ViewAdminUsers';

const UsersPage = () => {
    const { data: session, status } = useSession();
    const [adminUsers, setAdminUsers] = useState([]);

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
    }, []);

    if (status === 'loading') {
        return null;
    }

    return (
        <>
            <ViewAdminUsers users={adminUsers} refreshData={fetchAdminUsers} session={session} />
        </>
    )
}

export default UsersPage