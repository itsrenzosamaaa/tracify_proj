'use client'

import { Typography, Box, Breadcrumbs, Link } from '@mui/joy';
import React from 'react'
import { Paper, Grid } from '@mui/material';
import AvatarWithName from '../../components/Profile/Papers/AvatarWithName';
import Bio from '../../components/Profile/Papers/Bio';
import ProgBadgeDisplay from '../../components/Profile/Papers/ProgBadgeDisplay';
import PersonalInfo from '../../components/Profile/Papers/PersonalInfo';
import SchoolInfo from '../../components/Profile/Papers/SchoolInfo';
import RecentFoundItems from '../../components/Profile/Tables/RecentFoundItems';
import RecentLostItems from '../../components/Profile/Tables/RecentLostItems';
import RecentRatingsFromUser from '../../components/Profile/Tables/RecentRatingsFromUser';

const users = [
    { role: "Student", id: "C-2021-0001", name: "John Doe", contactNumber: '09123456789', email: "john@example.com", bio: 'Magandang buhay bossing! Kumusta ang buhay buhay?', successfulFoundItems: 0, schoolCategory: 'Higher Education', levelORAMBOT: '4th Year', course: 'BSIT' },
    { role: "Teacher", id: "T-2021-0001", name: "Jane Doe", contactNumber: '09123456789', email: "jane@example.com", bio: 'Magandang buhay bossing! Kumusta ang buhay buhay?', successfulFoundItems: 3, schoolCategory: 'Higher Education', levelORAMBOT: '4th Year', course: 'BSIT' },
    { role: "Janitor", id: "J-2021-0001", name: "Jim Smith", contactNumber: '09123456789', email: "jim@example.com", bio: 'Magandang buhay bossing! Kumusta ang buhay buhay?', successfulFoundItems: 9, schoolCategory: 'Higher Education', levelORAMBOT: '4th Year', course: 'BSIT' },
    { role: "Student", id: "C-2021-0002", name: "John Doe", contactNumber: '09123456789', email: "john@example.com", bio: 'Magandang buhay bossing! Kumusta ang buhay buhay?', successfulFoundItems: 15, schoolCategory: 'Higher Education', levelORAMBOT: '4th Year', course: 'BSIT' },
    { role: "Teacher", id: "T-2021-0002", name: "Jane Doe", contactNumber: '09123456789', email: "jane@example.com", bio: 'Magandang buhay bossing! Kumusta ang buhay buhay?', successfulFoundItems: 32, schoolCategory: 'Higher Education', levelORAMBOT: '4th Year', course: 'BSIT' },
    { role: "Janitor", id: "J-2021-0002", name: "Jim Smith", contactNumber: '09123456789', email: "jim@example.com", bio: 'Magandang buhay bossing! Kumusta ang buhay buhay?', successfulFoundItems: 45, schoolCategory: 'Higher Education', levelORAMBOT: '4th Year', course: 'BSIT' },
];

const UserProfile = ({ params }) => {
    const id = params.id;
    const searchUser = users.find((user) => user.id === id);
    return (
        <>
            <Grid
                sx={{
                    marginTop: "60px", // Ensure space for header
                    marginLeft: { xs: "0px", lg: "250px" }, // Shift content when sidebar is visible on large screens
                    padding: "20px",
                    transition: "margin-left 0.3s ease",
                }}
            >
                <Paper
                    elevation={2}
                    sx={{
                        padding: "1rem",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Grid item xs={12} lg={6}>
                        <h2>Profile</h2>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <Breadcrumbs aria-label="breadcrumbs">
                            <Link color="neutral" href="/office/dashboard">
                                Home
                            </Link>
                            <Link color="neutral" href="/office/users">
                                Users
                            </Link>
                            <Typography>Profile</Typography>
                        </Breadcrumbs>
                    </Grid>
                </Paper>
                <Grid container spacing={2} sx={{ marginBottom: "1rem", }}>
                    <Grid item xs={12} lg={3}>
                        <AvatarWithName user={searchUser} />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <Bio user={searchUser} />
                    </Grid>
                    <Grid item xs={12} lg={3}>
                        <ProgBadgeDisplay user={searchUser} />
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ marginBottom: "1rem", }}>
                    <Grid item xs={12} lg={6}>
                        <PersonalInfo user={searchUser} />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <SchoolInfo user={searchUser} />
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ marginBottom: "1rem", }}>
                    <Grid item xs={12} lg={6}>
                        <RecentFoundItems />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <RecentLostItems />
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ marginBottom: "1rem", }}>
                    <Grid item lg={12}>
                        <RecentRatingsFromUser />
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}

export default UserProfile