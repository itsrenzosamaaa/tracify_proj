'use client';

import { FormLabel, Input, Modal, ModalClose, ModalDialog, Button, Stack, Select, Option } from '@mui/joy';
import React, { useState } from 'react';

const AddOffice = ({ openModal, onClose, schoolCategory, fetchOfficers }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [officeName, setOfficeName] = useState('');
    const [officeAddress, setOfficeAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false); // To track submission status

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Disable button and show loading state

        const role = 'office';

        const formData = {
            id,
            username: name,
            password,
            role,
        };

        const formData1 = {
            accountId: id,
            email,
            schoolCategory,
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
                    alert('Office created successfully!');
                    onClose(); // Close modal after success
                    fetchOfficers();
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
            setLoading(false); // Re-enable submit button
        }
    };

    return (
        <>
            <Modal open={openModal} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Stack spacing={2}>
                        <form onSubmit={handleSubmit}>
                            <FormLabel>ID</FormLabel>
                            <Input
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                required
                            />
                            <FormLabel>Username</FormLabel>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <FormLabel>Password</FormLabel>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <FormLabel>Contact Number</FormLabel>
                            <Input
                                type="text"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                required
                            />
                            <FormLabel>Office Name</FormLabel>
                            <Input
                                type="text"
                                value={officeName}
                                onChange={(e) => setOfficeName(e.target.value)}
                                required
                            />
                            <FormLabel>Office Address</FormLabel>
                            <Input
                                type="text"
                                value={officeAddress}
                                onChange={(e) => setOfficeAddress(e.target.value)}
                                required
                            />
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Office'}
                            </Button>
                        </form>
                    </Stack>
                </ModalDialog>
            </Modal>
        </>
    );
};

export default AddOffice;
