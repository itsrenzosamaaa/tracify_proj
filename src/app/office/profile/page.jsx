'use client';

import {
    FormLabel, Input, Button, Stack, Typography, Box,
    Container, Snackbar,
} from '@mui/joy';
import React, { useState, useEffect } from 'react';
import { Paper } from '@mui/material';
import { useSession } from 'next-auth/react';

const Page = () => {
    const { data: session, status } = useSession();
    const [officeData, setOfficeData] = useState({});
    const [officeName, setOfficeName] = useState('');
    const [officeAddress, setOfficeAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            fetchData(session.user.id);
        }
    }, [session?.user?.id, status]);

    const fetchData = async (accountId) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/office/${accountId}`);
            const data = await response.json();
            if (response.ok) {
                setOfficeData(data);
                setOfficeName(data.officeName);
                setOfficeAddress(data.officeAddress);
                setContactNumber(data.contactNumber);
                setEmail(data.email);
            } else {
                console.error('Failed to fetch office data:', data.message);
            }
        } catch (error) {
            console.error('Failed to fetch office data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`/api/office/${officeData.accountId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    officeName,
                    officeAddress,
                    contactNumber,
                    email,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setOfficeData(result);
                setSnackbarOpen(true);
                setEditMode(false);
            } else {
                console.error('Update failed');
            }
        } catch (error) {
            console.error('Error updating office data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setOfficeName(officeData.officeName);
        setOfficeAddress(officeData.officeAddress);
        setContactNumber(officeData.contactNumber);
        setEmail(officeData.email);
        setEditMode(false);
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
                    <Typography level="h4" sx={{ mb: 2 }}>Office Profile</Typography>

                    {/* Main Form */}
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>Account ID</FormLabel>
                                    <Typography>{officeData.accountId}</Typography> {/* Display as Typography */}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>Office Name</FormLabel>
                                    {editMode ? (
                                        <Input
                                            required
                                            type="text"
                                            value={officeName}
                                            onChange={handleFieldChange(setOfficeName)}
                                            sx={{ flex: 1 }}
                                        />
                                    ) : (
                                        <Typography>{officeName}</Typography> // Display as Typography
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>Office Address</FormLabel>
                                    {editMode ? (
                                        <Input
                                            required
                                            type="text"
                                            value={officeAddress}
                                            onChange={handleFieldChange(setOfficeAddress)}
                                            sx={{ flex: 1 }}
                                        />
                                    ) : (
                                        <Typography>{officeAddress}</Typography> // Display as Typography
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>Email</FormLabel>
                                    {editMode ? (
                                        <Input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={handleFieldChange(setEmail)}
                                            sx={{ flex: 1 }}
                                        />
                                    ) : (
                                        <Typography>{email}</Typography> // Display as Typography
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>Contact Number</FormLabel>
                                    {editMode ? (
                                        <Input
                                            required
                                            type="text"
                                            value={contactNumber}
                                            onChange={handleFieldChange(setContactNumber)}
                                            sx={{ flex: 1 }}
                                        />
                                    ) : (
                                        <Typography>{contactNumber}</Typography> // Display as Typography
                                    )}
                                </Box>

                                {/* Edit and Cancel buttons */}
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
                            </Box>
                        </Stack>
                    </form>

                    {/* Snackbar for success notification */}
                    <Snackbar variant="solid" color="success" open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                        Office profile updated successfully!
                    </Snackbar>
                </Container>
            </Paper>
        </Box>
    );
};

export default Page;
