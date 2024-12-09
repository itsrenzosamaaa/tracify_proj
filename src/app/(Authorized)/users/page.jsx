'use client'

import React, { useState, useEffect, useCallback  } from 'react'
import { useSession } from 'next-auth/react';
import ViewUsers from '@/app/components/ViewUsers';

const UsersPage = () => {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState([]);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();

            if (session?.user?.schoolCategory === 'All') {
                setUsers(data);
            } else {
                const filteredStudents = data.filter(user => user.school_category === session?.user?.schoolCategory);
                setUsers(filteredStudents);
            }
        } catch (error) {
            console.error(error);
        }
    }, [session?.user?.schoolCategory]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchUsers();
        }
    }, [status, fetchUsers]);

    if (status === 'loading') {
        return null;
    }

    return (
        <>
            <ViewUsers users={users} refreshData={fetchUsers} />
        </>
    )
}

export default UsersPage