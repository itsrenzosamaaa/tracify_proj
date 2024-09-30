'use client'

import { FormLabel, Input, Modal, ModalDialog, Button, Stack, Typography, Box, Container, Select, Option } from '@mui/joy';
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
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state
    const [countdown, setCountdown] = useState(5); // Countdown timer
    const router = useRouter();

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/user/${accountId}`); // Fetch office data from your API
            const data = await response.json();
            setUserRole(data.userRole)
            setFirstName(data.firstname)
            setMiddleName(data.middlename)
            setLastName(data.lastname)
            setEmail(data.email)
            setContactNumber(data.contactNumber)
            setSchoolCategory(data.schoolCategory)
        } catch (error) {
            console.error('Failed to fetch office data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (showSuccessModal) {
            const timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);

            // Redirect when countdown reaches 0
            if (countdown === 0) {
                router.push(`/${sessionRole}/${category === "Basic Education" ? "basic_department" : "higher_department"}`);
            }

            // Clear interval when modal closes or component unmounts
            return () => clearInterval(timer);
        }
    }, [showSuccessModal, countdown, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/office/${accountId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    schoolCategory,
                    accountId,
                    officeName,
                    officeAddress,
                    contactNumber,
                    email,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Update success:', result);
                setShowSuccessModal(true);
            } else {
                console.error('Update failed');
            }
        } catch (error) {
            console.error('Error updating office data:', error);
        } finally {
            setLoading(false);
        }
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
            <Container sx={{ mt: 4 }}>
                <Typography level="h4" sx={{ mb: 2 }}>Add Office</Typography>

                {/* Main Form */}
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>Account ID</FormLabel>
                                <Input
                                    type="text"
                                    value={accountId}
                                    disabled
                                    required
                                    sx={{ flex: 1 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>School Category</FormLabel>
                                <Select
                                    required
                                    value={schoolCategory}
                                    onChange={(e, value) => setSchoolCategory(value)}
                                    sx={{ flex: 1 }}
                                >
                                    <Option value="Basic Education">Basic Education Department</Option>
                                    <Option value="Higher Education">Higher Education Department</Option>
                                </Select>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>User Role</FormLabel>
                                <Select
                                    required
                                    value={userRole}
                                    onChange={(e, value) => setUserRole(value)}
                                    sx={{ flex: 1 }}
                                >
                                    <Option value="student">Student</Option>
                                    <Option value="teacher">Teacher</Option>
                                </Select>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>Office Name</FormLabel>
                                <Input
                                    type="text"
                                    value={officeName}
                                    onChange={(e) => setOfficeName(e.target.value)}
                                    required
                                    sx={{ flex: 1 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>Office Address</FormLabel>
                                <Input
                                    type="text"
                                    value={officeAddress}
                                    onChange={(e) => setOfficeAddress(e.target.value)}
                                    required
                                    sx={{ flex: 1 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>Email</FormLabel>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    sx={{ flex: 1 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>Contact Number</FormLabel>
                                <Input
                                    type="text"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    required
                                    sx={{ flex: 1 }}
                                />
                            </Box>

                            <Button type="submit" sx={{ mt: 2 }} loading={loading}>
                                Add Office
                            </Button>
                        </Box>
                    </Stack>
                </form>

                {/* Success Modal */}
                <Modal open={showSuccessModal}>
                    <ModalDialog>
                        <Typography level="h3">Success!</Typography>
                        <Typography level="body1">
                            Office has been added successfully. Redirecting in {countdown} seconds...
                        </Typography>
                        <Button onClick={() => router.push(`/${sessionRole}/${category}`)} sx={{ mt: 2 }}>
                            Redirect now
                        </Button>
                    </ModalDialog>
                </Modal>
            </Container>
        </Box>
    );
};

export default EditUserPage;
