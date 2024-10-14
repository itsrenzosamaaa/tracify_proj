'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import AdminDashboard from '@/app/components/AdminDashboard';
import OfficeDashboard from '@/app/components/OfficeDashboard';
import UserDashboard from '@/app/components/UserDashboard';
import { Box } from '@mui/joy';

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
    if(status === 'authenticated'){
      fetchRoles();
    }
  }, [session, status])

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (status === 'loading' || !isClient) {
    return null; // Don't render anything during loading or server-side
  }

  return (
    <>
      <Box
        sx={{
          marginTop: '60px', // Ensure space for header
          marginLeft: { xs: '0px', lg: '250px' }, // Shift content when sidebar is visible on large screens
          padding: '20px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {role === 'Admin' && <AdminDashboard />}
        {role === 'Officer' && <OfficeDashboard />}
        {role === 'User' && <UserDashboard />}
      </Box>
    </>
  )
}

export default DashboardPage