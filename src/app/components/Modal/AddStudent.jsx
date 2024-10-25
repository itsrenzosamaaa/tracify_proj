'use client'

import { Modal, ModalClose, ModalDialog, Stack, Grid, Box, FormControl, FormLabel, Input, Select, Option, Button, Typography } from '@mui/joy'
import React, { useState } from 'react'

const AddStudentModal = ({ open, onClose, resetForm, fetchStudentUsers }) => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [schoolCategory, setSchoolCategory] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();

        const accountFormData = {
            username,
            password,
            emailAddress,
            type: 'student',
            date_created: new Date(),
        };

        const studentFormData = {
            firstname,
            lastname,
            contactNumber,
            school_category: schoolCategory,
            account: '', // Will be set after account creation
        };

        try {
            // First, create the account and retrieve its _id
            const accountResponse = await fetch('/api/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountFormData),
            });

            const accountData = await accountResponse.json();

            if (accountData.success) {
                // Use the _id from accountData to set accountId in studentFormData
                studentFormData.account = accountData._id;

                // Now, create the admin with the account _id
                const adminResponse = await fetch('/api/student-users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(studentFormData),
                });

                if (adminResponse.ok) {
                    alert('Student user created successfully');
                    resetForm();
                    fetchStudentUsers(); // Refresh the list of users
                } else {
                    alert('Error creating student user');
                }
            } else {
                alert('Error creating account');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while creating/updating the user');
        }
    };
  return (
    <>
        <Modal open={open} onClose={onClose}>
            <ModalDialog>
                <ModalClose />
                <Typography level="h4" gutterbottom>Add Student</Typography>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <Grid container spacing={2} sx={{ width: '100%' }}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <FormLabel>Username</FormLabel>
                                        <Input
                                            name="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <FormLabel>Password</FormLabel>
                                        <Input
                                            name="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} sx={{ width: '100%', marginTop: '6px' }}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <FormLabel>First Name</FormLabel>
                                        <Input
                                            name="firstname"
                                            value={firstname}
                                            onChange={(e) => setFirstname(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <FormLabel>Last Name</FormLabel>
                                        <Input
                                            name="lastname"
                                            value={lastname}
                                            onChange={(e) => setLastname(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>

                        <FormControl>
                            <FormLabel>School Category</FormLabel>
                            <Select
                                name="role"
                                value={schoolCategory}
                                onChange={(e, value) => setSchoolCategory(value)}
                            >
                                <Option value="Higher Education">Higher Education</Option>
                                <Option value="Basic Education">Basic Education</Option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Contact Number</FormLabel>
                            <Input
                                name="contactNumber"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Email Address</FormLabel>
                            <Input
                                name="email"
                                type="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                            />
                        </FormControl>

                        <Button type="submit" fullWidth>
                            Add Student
                        </Button>
                    </Stack>
                </form>
            </ModalDialog>
        </Modal>
    </>
  )
}

export default AddStudentModal