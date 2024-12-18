'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { Box } from '@mui/joy';
import ViewRoles from '@/app/components/ViewRoles';

const RolesPage = () => {
    const { data: session, status } = useSession();
    const [roles, setRoles] = useState();
    const [adminUsers, setAdminUsers] = useState([]);

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles');
            const data = await response.json();
            const filteredRoles = data.filter(role => role.name.toLowerCase() !== "super admin")
            setRoles(filteredRoles);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchAdminUsers = async () => {
        try {
            const response = await fetch('/api/admin');
            const data = await response.json();
            const filteredAdmins = data.filter(admin => !admin.role || admin.role.name !== 'Super Admin');
            setAdminUsers(filteredAdmins);
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
            <ViewRoles admin={adminUsers} roles={roles} session={session} refreshData={fetchRoles} />
        </>
    )
}

export default RolesPage