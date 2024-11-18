'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react';
import AdminDashboard from '@/app/components/Dashboard/AdminDashboard';
import UserDashboard from '@/app/components/Dashboard/UserDashboard';
import Loading from '@/app/components/Loading';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data)
    } catch (error) {
      console.error(error)
    }
  };

  useEffect(() => {
    fetchUsers();
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
      {session.user.userType === 'admin' && <AdminDashboard users={users} session={session} />}
      {session.user.userType === 'user' && <UserDashboard users={users} session={session} status={status} />}
    </>
  )
}

export default DashboardPage