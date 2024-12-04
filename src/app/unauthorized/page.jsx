'use client'

import { Box, Button, Typography } from '@mui/joy';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useRouter } from 'next/navigation';
import React from 'react';

const Unauthorized = () => {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '90vh',
        textAlign: 'center',
        padding: 2,
      }}
    >
      <LockOutlinedIcon sx={{ fontSize: 50, marginBottom: 2, color: 'primary.main' }} />
      <Typography level="h4" sx={{ marginBottom: 2 }}>
        Oops! It looks like you tried to access a restricted page.
      </Typography>
      <Typography sx={{ marginBottom: 3 }}>
        You don&apos;t have permission to view this page. Please go back to the previous page and try again.
      </Typography>
      <Button onClick={() => router.back()} variant="soft" color="primary">
        Go Back
      </Button>
    </Box>
  );
};

export default Unauthorized;
