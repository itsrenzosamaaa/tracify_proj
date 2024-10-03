'use client'

import React, { useState } from "react";
import { Paper } from '@mui/material';
import { Box, Modal, Typography, Button, ModalDialog, ModalClose, Input, FormLabel, Stack, FormHelperText } from '@mui/joy';
import { useSession } from "next-auth/react";  // Import useSession to handle session state

// Function to calculate age based on birthdate
const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
};

const PersonalInfo = ({ user }) => {
    const { data: session, status } = useSession();  // Use useSession to get session status
    const [open, setOpen] = useState(false);
    const [birthdate, setBirthdate] = useState(user?.birthDate ? user.birthDate.split('T')[0] : '');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Close modal helper
    const onClose = () => {
        setOpen(false);
        setError(null);
        setSuccess(false);
    };

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setBirthdate(selectedDate); // Keep the YYYY-MM-DD format for `type="date"`
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validation: Check if birthdate is selected
        if (!birthdate) {
            setError('Please select a valid birthdate.');
            return;
        }

        // Simulated API call (Replace with actual API call logic)
        try {
            alert(`Birthdate set to: ${birthdate}`);
            setSuccess(true);
            onClose();
        } catch (error) {
            setError('Error updating birthdate. Please try again.');
        }
    };

    // Show loading if session is still loading
    if (status === "loading") {
        return <Typography>Loading...</Typography>;
    }

    // If session is available, render the component
    if (session && session.user) {
        return (
            <Paper elevation={2}>
                <Box
                    sx={{
                        padding: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Box sx={{ fontWeight: 700 }}>
                        <Typography>{user.role} ID:</Typography>
                        <Typography>Birthday:</Typography>
                        <Typography>Age:</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography>{user.accountId}</Typography>

                        <Typography
                            color={session.user.role === 'user' ? 'primary' : ''}
                            onClick={() => session.user.role === 'user' && setOpen(true)}
                            sx={{
                                cursor: session.user.role === 'user' ? 'pointer' : 'default',
                                textDecoration: session.user.role === 'user' ? 'underline' : '',
                            }}
                        >
                            {user.birthDate
                                ? new Date(user.birthDate).toLocaleDateString()
                                : session.user.role === 'user'
                                    ? "Set your Birthday"
                                    : "Not yet provided"
                            }
                        </Typography>

                        <Typography>{calculateAge(user.birthDate)}</Typography>
                    </Box>
                </Box>

                {/* Modal for Setting Birthdate */}
                <Modal open={open} onClose={onClose}>
                    <ModalDialog>
                        <ModalClose />
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <FormLabel>Birthday:</FormLabel>
                                <Input
                                    type="date"
                                    name="birthdate"
                                    slotProps={{
                                        input: {
                                            max: new Date(),
                                        },
                                    }}
                                    value={birthdate}
                                    onChange={handleDateChange}
                                    required
                                />
                                {error && <FormHelperText error>{error}</FormHelperText>}
                                <FormHelperText>You may set your birthday once!</FormHelperText>
                                <Button type="submit">Set Birthday</Button>
                            </Stack>
                        </form>
                    </ModalDialog>
                </Modal>
            </Paper>
        );
    }

    return <Typography>Error: Could not load session</Typography>;  // Fallback if session fails to load
};

export default PersonalInfo;
