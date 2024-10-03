'use client';

import { FormLabel, Input, Modal, ModalDialog, Button, Stack, Typography, Box, Container } from '@mui/joy';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AddOfficePage = ({ category, setRole, sessionRole }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [officeName, setOfficeName] = useState('');
    const [officeAddress, setOfficeAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state
    const [countdown, setCountdown] = useState(5); // Countdown timer
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = {
            id,
            username: name,
            password,
            role: setRole,
        };

        const formData1 = {
            accountId: id,
            email,
            schoolCategory: category,
            officeName,
            officeAddress,
            contactNumber,
        };

        try {
            // Create account first
            const response = await fetch('/api/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // If account creation succeeds, create office entry
                const res = await fetch('/api/office', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData1),
                });

                if (res.ok) {
                    setShowSuccessModal(true); // Show success modal
                    // Clear form fields
                    setId('');
                    setName('');
                    setPassword('');
                    setOfficeName('');
                    setOfficeAddress('');
                    setContactNumber('');
                    setEmail('');
                } else {
                    const data1 = await res.json();
                    alert(`Failed to add office: ${data1.error}`);
                }
            } else {
                const data = await response.json();
                alert(`Failed to add account: ${data.error}`);
            }
        } catch (error) {
            console.error('Error adding office:', error);
            alert('An error occurred while adding the office.');
        } finally {
            setLoading(false);
        }
    };

    // Handle countdown for redirection
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
    }, [showSuccessModal, countdown, router, category, sessionRole]);

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
                                <FormLabel sx={{ minWidth: '120px' }}>ID</FormLabel>
                                <Input
                                    type="text"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    required
                                    sx={{ flex: 1 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>Username</FormLabel>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    sx={{ flex: 1 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>Password</FormLabel>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    sx={{ flex: 1 }}
                                />
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
                        <Button onClick={() => router.push(`/${sessionRole}/${category === "Basic Education" ? "basic_department" : "higher_department"}`)} sx={{ mt: 2 }}>
                            Redirect now
                        </Button>
                    </ModalDialog>
                </Modal>
            </Container>
        </Box>
    );
};

export default AddOfficePage;
