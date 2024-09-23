'use client';

import React, { useState } from 'react';
import {
    Box,
} from '@mui/material';
import { Button } from '@mui/joy';
import AddAdmin from '../components/AddAdmin';
import AddOffice from '../components/AddOffice';
import AddUser from '../components/AddUser';

const CreateUserForm = () => {
    const [formData, setFormData] = useState({
        id: '',
        firstname: '',
        middlename: '',
        lastname: '',
        username: '',
        password: '',
        email: '',
        contactNumber: '',
        role: '',
        userRole: '',
        schoolCategory: '',
        officeName: '',
        officeAddress: '',
    });
    const [openAddAdmin, setOpenAddAdmin] = useState(false);
    const [openAddOffice, setOpenAddOffice] = useState(false);
    const [openAddUser, setOpenAddUser] = useState(false);

    const closeModal = () => {
        setOpenAddAdmin(false);
        setOpenAddOffice(false);
        setOpenAddUser(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let preparedData = { ...formData };

        // Remove empty fields
        Object.keys(preparedData).forEach((key) => {
            if (!preparedData[key]) {
                delete preparedData[key];
            }
        });

        try {
            const response = await fetch('/api/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preparedData),
            });
            const data = await response.json();

            if (response.ok) {
                alert('Account created successfully!');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error creating account:', error);
            alert('Failed to create account');
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
            <Button onClick={() => setOpenAddAdmin(true)}>Add Admin</Button>
            <AddAdmin openModal={openAddAdmin} onClose={closeModal} />
            <Button onClick={() => setOpenAddOffice(true)}>Add Office</Button>
            <AddOffice openModal={openAddOffice} onClose={closeModal} />
            <Button onClick={() => setOpenAddUser(true)}>Add User</Button>
            <AddUser openModal={openAddUser} onClose={closeModal} />
        </Box>
    );
};

export default CreateUserForm;
