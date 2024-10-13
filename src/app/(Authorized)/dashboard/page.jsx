'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import AdminDashboard from '@/app/components/AdminDashboard';
import OfficeDashboard from '@/app/components/OfficeDashboard';
import UserDashboard from '@/app/components/UserDashboard';
import { Box } from '@mui/joy';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

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
        {session.user.role === 'Admin' && <AdminDashboard />}
        {session.user.role === 'Officer' && <OfficeDashboard />}
        {session.user.role === 'User' && <UserDashboard />}
      </Box>
    </>
  )
}

export default DashboardPage