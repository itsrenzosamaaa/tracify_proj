'use client';

import {
    FormLabel,
    Input,
    Modal,
    ModalClose,
    ModalDialog,
    Button,
    Stack,
    Select,
    Option,
    Typography,
    Box
} from '@mui/joy';
import React, { useState } from 'react';

const AddUser = ({ openModal, onClose, schoolCategory, fetchUsers }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [userRole, setUserRole] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const emailRegex = /^[A-Za-z\s]+@thelewiscollege\.edu\.ph$/;

        if (!emailRegex.test(email)) {
            alert('Not a valid email.');
            setLoading(false);
            return;
        }

        const role = 'user';
        const formData = {
            id,
            username: name,
            password,
            role,
        };

        const formData1 = {
            accountId: id,
            userRole,
            firstname: firstName,
            middlename: middleName,
            lastname: lastName,
            email,
            schoolCategory,
            contactNumber,
        };

        try {
            const response = await fetch('/api/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const res = await fetch('/api/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData1),
                });

                if (res.ok) {
                    alert('User created successfully!');
                    onClose();
                    fetchUsers();
                    setId('');
                    setName('');
                    setPassword('');
                    setUserRole('');
                    setFirstName('');
                    setMiddleName('');
                    setLastName('');
                    setEmail('');
                    setContactNumber('');
                } else {
                    const errorData = await res.json();
                    alert(`Failed to add user: ${errorData.error}`);
                }
            } else {
                const errorData = await response.json();
                alert(`Failed to add account: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error adding account: ', error);
            alert('An error occurred while adding the account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={openModal} onClose={onClose}>
            <ModalDialog>
                <ModalClose />
                <Typography level="h4" sx={{ mb: 2 }}>Add New User</Typography>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                <FormLabel sx={{ minWidth: '120px' }}>First Name</FormLabel>
                                <Input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    sx={{ flex: 1 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>Middle Initial</FormLabel>
                                <Input
                                    type="text"
                                    value={middleName}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                    required
                                    sx={{ flex: 1 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormLabel sx={{ minWidth: '120px' }}>Last Name</FormLabel>
                                <Input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
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

                            {userRole && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormLabel sx={{ minWidth: '120px' }}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)} ID</FormLabel>
                                    <Input
                                        type="text"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        required
                                        sx={{ flex: 1 }}
                                    />
                                </Box>
                            )}

                            <Button type="submit" sx={{ mt: 2 }} loading={loading}>
                                Add {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ModalDialog>
        </Modal>
    );
};

export default AddUser;
