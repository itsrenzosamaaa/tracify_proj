'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { Box } from '@mui/joy';
import ViewStudentsUser from '@/app/components/ViewStudentUsers';

const UsersPage = () => {
    const { data: session, status } = useSession();
    const [studentUsers, setStudentUsers] = useState([]);

    const fetchStudentUsers = async () => {
        try {
            const response = await fetch('/api/student-users');
            const data = await response.json();
            setStudentUsers(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchStudentUsers();
    }, []);

    if (status === 'loading') {
        return null;
    }

    return (
        <>
            <ViewStudentsUser users={studentUsers} fetchStudentUsers={fetchStudentUsers} session={session} />
        </>
    )
}

export default UsersPage