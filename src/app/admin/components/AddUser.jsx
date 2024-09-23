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
    ModalOverflow,
    Typography,
    Box
} from '@mui/joy';
import React, { useState } from 'react';

const AddUser = ({ openModal, onClose }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [userRole, setUserRole] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [schoolCategory, setSchoolCategory] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailRegex = /^[A-Za-z\s]+@thelewiscollege\.edu\.ph$/;

        const checkEmail = emailRegex.test(email);

        if(!checkEmail){
            return alert('Not a valid email.');
        };

        const role = 'user';

        const formData = {
            id,
            username: name,
            password,
            role,
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
                    'Content-Type': 'application/json', // Indicate you're sending JSON
                },
                body: JSON.stringify(formData), // Convert form data to JSON
            });

            if (response.ok) {
                alert('User created successfully!');
                onClose(); // Close modal after successful creation
            } else {
                const data = await response.json();
                alert(`Failed to add account: ${data.error}`);
            }
        } catch (error) {
            console.error('Error adding account: ', error);
            alert('An error occurred while adding the account.');
        }
    };

    return (
        <Modal open={openModal} onClose={onClose}>
            <ModalOverflow>
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
                                    <FormLabel sx={{ minWidth: '120px' }}>School Category</FormLabel>
                                    <Select
                                        required
                                        value={schoolCategory}
                                        onChange={(e, value) => setSchoolCategory(value)}
                                        sx={{ flex: 1 }}
                                    >
                                        <Option value="Basic Education">Basic Education</Option>
                                        <Option value="Higher Education">Higher Education</Option>
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

                                <Button type="submit" sx={{ mt: 2 }}>
                                    Add {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </ModalDialog>
            </ModalOverflow>
        </Modal>
    );
};

export default AddUser;
