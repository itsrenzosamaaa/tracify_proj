'use client';

import {
    FormLabel,
    Input,
    Button,
    Stack,
    Typography,
    Box,
    Container,
    Select,
    Option,
    Snackbar,
    Alert,
} from '@mui/joy';
import { Paper } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const EditUserPage = ({ accountId, category, sessionRole }) => {
    const [userRole, setUserRole] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [schoolCategory, setSchoolCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [editMode, setEditMode] = useState(false); // State for editing mode
    const [initialData, setInitialData] = useState({}); // Store initial user data
    const router = useRouter();

    // Fetch user data for editing
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/user/${accountId}`);
                const data = await response.json();
                setUserRole(data.userRole);
                setFirstName(data.firstname);
                setMiddleName(data.middlename);
                setLastName(data.lastname);
                setEmail(data.email);
                setContactNumber(data.contactNumber);
                setSchoolCategory(data.schoolCategory);

                // Store initial data
                setInitialData({
                    userRole: data.userRole,
                    firstname: data.firstname,
                    middlename: data.middlename,
                    lastname: data.lastname,
                    email: data.email,
                    contactNumber: data.contactNumber,
                    schoolCategory: data.schoolCategory,
                });
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [accountId]);


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/user/${accountId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    schoolCategory,
                    accountId,
                    userRole,
                    firstname: firstName,
                    middlename: middleName,
                    lastname: lastName,
                    contactNumber,
                    email,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Update success:', result);
                setInitialData(result);
                setSnackbarOpen(true);
                setEditMode(false); // Exit edit mode after successful update
            } else {
                console.error('Update failed');
            }
        } catch (error) {
            console.error('Error updating user data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel action to revert data
    const handleCancel = () => {
        setUserRole(initialData.userRole);
        setFirstName(initialData.firstname);
        setMiddleName(initialData.middlename);
        setLastName(initialData.lastname);
        setEmail(initialData.email);
        setContactNumber(initialData.contactNumber);
        setSchoolCategory(initialData.schoolCategory);
        setEditMode(false); // Exit edit mode
    };

    return (
        <Box
            sx={{
                marginTop: '60px',
                marginLeft: { xs: '0px', lg: '250px' },
                padding: '20px',
                transition: 'margin-left 0.3s ease',
            }}
        >
            <Paper elevation={2} sx={{ padding: '1rem' }}>
                <Container sx={{ mt: 4 }}>
                    <Typography level="h4" sx={{ mb: 2 }}>Edit User</Typography>

                    {/* Main Form */}
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>Account ID</FormLabel>
                                    <Typography>{accountId}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>School Category</FormLabel>
                                    {editMode ? (
                                        <Select
                                            required
                                            value={schoolCategory}
                                            onChange={(e, value) => setSchoolCategory(value)}
                                            sx={{ flex: 1 }}
                                        >
                                            <Option value="Basic Education">Basic Education Department</Option>
                                            <Option value="Higher Education">Higher Education Department</Option>
                                        </Select>
                                    ) : (
                                        <Typography>{schoolCategory}</Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>User Role</FormLabel>
                                    {editMode ? (
                                        <Select
                                            required
                                            value={userRole}
                                            onChange={(e, value) => setUserRole(value)}
                                            sx={{ flex: 1 }}
                                        >
                                            <Option value="student">Student</Option>
                                            <Option value="teacher">Teacher</Option>
                                        </Select>
                                    ) : (
                                        <Typography>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>First Name</FormLabel>
                                    {editMode ? (
                                        <Input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            sx={{ flex: 1 }}
                                        />
                                    ) : (
                                        <Typography>{firstName}</Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>Middle Name</FormLabel>
                                    {editMode ? (
                                        <Input
                                            type="text"
                                            value={middleName}
                                            onChange={(e) => setMiddleName(e.target.value)}
                                            required
                                            sx={{ flex: 1 }}
                                        />
                                    ) : (
                                        <Typography>{middleName}</Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>Last Name</FormLabel>
                                    {editMode ? (
                                        <Input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            sx={{ flex: 1 }}
                                        />
                                    ) : (
                                        <Typography>{lastName}</Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>Email</FormLabel>
                                    {editMode ? (
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            sx={{ flex: 1 }}
                                        />
                                    ) : (
                                        <Typography>{email}</Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>Contact Number</FormLabel>
                                    {editMode ? (
                                        <Input
                                            type="text"
                                            value={contactNumber}
                                            onChange={(e) => setContactNumber(e.target.value)}
                                            required
                                            sx={{ flex: 1 }}
                                        />
                                    ) : (
                                        <Typography>{contactNumber}</Typography>
                                    )}
                                </Box>

                                {/* Edit and Cancel buttons */}
                                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                    {editMode ? (
                                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                            <Button type="submit" loading={loading}>
                                                Save Changes
                                            </Button>
                                            <Button variant="outlined" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Button variant="solid" onClick={() => setEditMode(true)} sx={{ mt: 2 }}>
                                            Edit Profile
                                        </Button>
                                    )}
                                </Stack>
                            </Box>
                        </Stack>
                    </form>

                    <Snackbar variant="solid" color="success" open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                        User profile updated successfully!
                    </Snackbar>
                </Container>
            </Paper>
        </Box>
    );
};

export default EditUserPage;
