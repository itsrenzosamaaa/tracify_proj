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
        firstname: '',
        middlename: '',
        lastname: '',
        username: '',
        password: '',
        email: '',
        role: '',
        userType: '',
        schoolCategory: '',
        department: '',
        year: '',
        course: '',
        position: '',
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
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Role</InputLabel>
                    <Select name="role" value={formData.role} onChange={handleChange} required>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="office">Officer</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                    </Select>
                </FormControl>

                {/* Conditionally render name fields based on "user" role */}
                {formData.role === 'user' && (
                    <>
                        {/* Name Fields (only visible when role is 'user') */}
                        <TextField
                            label="First Name"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Middle Name"
                            name="middlename"
                            value={formData.middlename}
                            onChange={handleChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Last Name"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={{ mb: 2 }}
                        />

                        {/* User Type Selection */}
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>User Type</InputLabel>
                            <Select name="userType" value={formData.userType} onChange={handleChange} required>
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="teacher">Teacher</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Student-specific fields */}
                        {formData.userType === 'student' && (
                            <>
                                <TextField
                                    label="Year"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Course"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                />
                            </>
                        )}

                        {/* Teacher-specific fields */}
                        {formData.userType === 'teacher' && (
                            <>
                                <TextField
                                    label="Department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Position"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                />
                            </>
                        )}
                    </>
                )}

                {/* Officer-specific fields */}
                {formData.role === 'office' && (
                    <>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>School Category</InputLabel>
                            <Select
                                name="schoolCategory"
                                value={formData.schoolCategory}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="Basic Education Department">Basic Education</MenuItem>
                                <MenuItem value="Higher Education Department">Higher Education</MenuItem>
                            </Select>
                        </FormControl>

                        {formData.schoolCategory === 'Higher Education Department' && (
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="CCS">CCS</MenuItem>
                                    <MenuItem value="CBE">CBE</MenuItem>
                                    <MenuItem value="CTE">CTE</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </>
                )}

                {/* Username and Password */}
                <TextField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />

                {/* Email */}
                <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />

                {/* Submit Button */}
                <Button type="submit" variant="contained" color="primary">
                    Create Account
                </Button>
            </Box>
        </Box>
    );
};

export default CreateUserForm;
