import React from 'react'
import { Typography, Grid, Breadcrumbs, Link, Box } from '@mui/joy';
import { useTheme, useMediaQuery } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const TitleBreadcrumbs = ({ title, text }) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('md'));
    return (
        <>
            <Box elevation={1} sx={{ marginY: '1rem', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between' }}>
                <Typography level="h5" sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {title}
                </Typography>
                <Breadcrumbs separator=">" aria-label="breadcrumb" sx={{ backgroundColor: isXs ? '#e0e0e0' : '', fontSize: { xs: '14px', sm: '15px', md: '15px' } }}>
                    <Link underline="none" color="inherit" href="/dashboard" sx={{ gap: 1 }}>
                        <HomeIcon sx={{ fontSize: '18px' }} />
                        Home
                    </Link>
                    <Typography color="text.primary" sx={{ fontSize: { xs: '14px', sm: '15px', md: '15px' } }}>{text}</Typography>
                </Breadcrumbs>
            </Box>
        </>
    )
}

export default TitleBreadcrumbs