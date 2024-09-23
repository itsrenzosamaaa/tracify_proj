'use client';

import { FormLabel, Input, Modal, ModalClose, ModalDialog, Button, Stack, Select, Option } from '@mui/joy';
import React, { useState } from 'react'

const AddOffice = ({ openModal, onClose }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [schoolCategory, setSchoolCategory] = useState('');
    const [officeName, setOfficeName] = useState('');
    const [officeAddress, setOfficeAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const role = 'office';

        const formData = {
            username: name,
            password: password,
            role: role,
            email: email,
            schoolCategory: schoolCategory,
            officeName: officeName,
            officeAddress: officeAddress,
            contactNumber: contactNumber,
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
                alert('Office created successfully!');
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
                            <FormLabel>School Category</FormLabel>
                            <Select required value={schoolCategory} onChange={(e, value) => setSchoolCategory(value)}>
                                <Option value="Basic Education">Basic Education</Option>
                                <Option value="Higher Education">Higher Education</Option>
                            </Select>
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
                            <Button type="submit">Add Office</Button>
                        </form>
                    </Stack>
                </ModalDialog>
            </Modal>
        </>
    );
}

export default AddOffice