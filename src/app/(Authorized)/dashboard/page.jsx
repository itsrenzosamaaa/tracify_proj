'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import AdminDashboard from '@/app/components/Dashboard/AdminDashboard';
import UserDashboard from '@/app/components/Dashboard/UserDashboard';
import Loading from '@/app/components/Loading';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [role, setRole] = useState(null);
  const [isClient, setIsClient] = useState(false);

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
      {session.user.userType === 'Admin' && <AdminDashboard session={session} />}
      {session.user.userType === 'User' && <UserDashboard session={session} />}
    </>
  )
}

export default DashboardPage