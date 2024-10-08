'use client'

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { Breadcrumbs, Link, Typography, Button } from '@mui/joy';
import DepTable from "../components/DepTable";

const HigherDepartment = () => {
    const [officers, setOfficers] = useState([]);
    const [users, setUsers] = useState([]);
    const [isOfficerSelected, setIsOfficerSelected] = useState(true); // New state to toggle between officers and users
    const [loading, setLoading] = useState(true);

    const closeModal = () => {
        setOpenAddOffice(false);
        setOpenAddUser(false);
    };

    // Fetch Officers
    const fetchOfficers = async () => {
        try {
            const response = await fetch('/api/office');
            const data = await response.json();
            const highDepOfficers = data.filter(officer => officer.schoolCategory === 'Higher Education');
            setOfficers(highDepOfficers);
        } catch (error) {
            console.error("Failed to fetch officers: ", error);
        }
    };

    // Fetch Users
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            const highDepUsers = data.filter(user => user.schoolCategory === 'Higher Education');
            setUsers(highDepUsers);
        } catch (error) {
            console.error("Failed to fetch users: ", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetch
            await fetchOfficers();
            await fetchUsers();
            setLoading(false); // Set loading to false after fetch
        };
        fetchData();
    }, []);

    // Handle category change between Officers and Users
    const handleCategoryChange = (event) => {
        setIsOfficerSelected(event.target.value === 'officers');
    };

    return (
        <Box
            sx={{
                marginTop: '60px', // Ensure space for header
                marginLeft: { xs: '0px', lg: '250px' }, // Shift content when sidebar is visible on large screens
                padding: '20px',
                transition: 'margin-left 0.3s ease',
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper
                        elevation={2}
                        sx={{
                            padding: "1rem",
                            marginBottom: "1rem",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Grid item xs={12} lg={6}>
                                <Typography level="h2">
                                    Higher Department ({isOfficerSelected ? "Officers" : "Users"})
                                </Typography>
                            </Grid>
                            <Grid item xs={12} lg={6} sx={{ textAlign: 'right' }}>
                                <Breadcrumbs aria-label="breadcrumbs" sx={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
                                    <Link color="neutral" href="/admin/dashboard">
                                        Home
                                    </Link>
                                    <Typography>Higher Department</Typography>
                                </Breadcrumbs>
                            </Grid>
                        </Grid>
                    </Paper>
                    <Paper elevation={2} sx={{ padding: '1rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <FormControl>
                                <FormLabel sx={{ fontSize: { sx: '0.5rem' } }}>Choose Category</FormLabel>
                                <RadioGroup
                                    row
                                    aria-labelledby="category-selection"
                                    name="category"
                                    value={isOfficerSelected ? 'officers' : 'users'} // Set the current selection
                                    onChange={handleCategoryChange} // Handle category change
                                >
                                    <FormControlLabel
                                        disabled={loading}
                                        value="officers"
                                        control={<Radio />}
                                        label="Officers"
                                        sx={{ fontSize: { sx: '0.5rem', lg: '1rem' } }}
                                    />
                                    <FormControlLabel
                                        disabled={loading}
                                        value="users"
                                        control={<Radio />}
                                        label="Users"
                                        sx={{ fontSize: { sx: '0.5rem', lg: '1rem' } }}
                                    />
                                </RadioGroup>
                            </FormControl>
                            <Box sx={{ gap: 2 }}>
                                <Button disabled={loading} component={Link} href='/admin/higher_department/add_officer'>Add Office</Button>
                                <Button disabled={loading} component={Link} href='/admin/higher_department/add_user'>Add User</Button>
                            </Box>
                        </Box>
                        <Box>
                            {loading ? (
                                <Typography>Loading...</Typography> // Show loading indicator
                            ) : (
                                isOfficerSelected ? (
                                    <DepTable data={officers} type="officer" />
                                ) : (
                                    <DepTable data={users} type="user" />
                                )
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default HigherDepartment;
