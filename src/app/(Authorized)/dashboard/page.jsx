'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import AdminDashboard from '@/app/components/AdminDashboard';
import UserDashboard from '@/app/components/UserDashboard';
import Loading from '@/app/components/Loading';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [role, setRole] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/roles');
        const data = await response.json();
        const findRole = data.find(role => role._id === session.user.role);
        setRole(findRole.userType);
      } catch (error) {
        console.error(error);
      }
    }

    if (status === 'authenticated') {
      fetchRoles();
    }
  }, [session, status])


  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (status === 'loading') {
    return <Loading />;
  }

  return (
    <>
      {role === 'Admin' && <AdminDashboard session={session} />}
      {role === 'User' && <UserDashboard session={session} />}
    </>
  )
}

export default DashboardPage