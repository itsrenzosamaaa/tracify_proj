'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { Box } from '@mui/joy';
import ViewStudentsUser from '@/app/components/ViewStudentUsers';

const UsersPage = () => {
    const { data: session, status } = useSession();
    const [studentUsers, setStudentUsers] = useState([]);

    console.log(studentUsers)
    console.log(session)

    useEffect(() => {
        const fetchStudentUsers = async () => {
            try {
                const response = await fetch('/api/student-users');
                const data = await response.json();
                if(session?.user?.schoolCategory === 'All'){
                    setStudentUsers(data);
                }else{
                    const filteredStudents = data.filter(user => user.school_category === session?.user?.schoolCategory);
                    setStudentUsers(filteredStudents);
                }
            } catch (error) {
                console.error(error);
            }
        }
        if(status === 'authenticated'){
            fetchStudentUsers();
        }
    }, [status, session?.user?.schoolCategory]);

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