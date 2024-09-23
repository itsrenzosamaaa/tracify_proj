'use client';

import { FormLabel, Input, Modal, ModalClose, ModalDialog, Button, Stack } from '@mui/joy';
import React, { useState } from 'react';

const AddAdmin = ({ openModal, onClose }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const role = 'admin';

        const formData = {
            username: name,
            password: password,
            role: role
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
                alert('Admin created successfully!');
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
        <>
            <Modal
                open={openModal}
                onClose={onClose}
            >
                <ModalDialog>
                    <ModalClose />
                    <Stack spacing={2}>
                        <form onSubmit={handleSubmit}>
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
                            <Button type="submit">Add Admin</Button>
                        </form>
                    </Stack>
                </ModalDialog>
            </Modal>
        </>
    );
};

export default AddAdmin;
