'use client'

import React, { useState } from 'react';
import {
    TextField,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
    Select,
    Box,
} from '@mui/material';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let preparedData = { ...formData };

        Object.keys(preparedData).forEach((key) => {
            if (!preparedData[key]) {
                delete preparedData[key];
            }
        });

        console.log(preparedData)

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
                alert('Account created successfully!')
            } else {
                alert(`Error ${data.error}`)
            }
        } catch (error) {
            console.error('Error creating account:', error);
            alert('Failed to create account');
        }
    };

    return (
        <Box
            sx={{
                marginTop: "60px", // Ensure space for header
                marginLeft: { xs: '0px', lg: '250px' }, // Shift content when sidebar is visible on large screens
                padding: "20px",
                transition: 'margin-left 0.3s ease',
            }}
        >
            
        </Box>
    );
};

export default CreateUserForm;
