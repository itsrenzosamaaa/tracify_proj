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
    const [openAddAdmin, setOpenAddAdmin] = useState(false);
    const [openAddOffice, setOpenAddOffice] = useState(false);
    const [openAddUser, setOpenAddUser] = useState(false);

    const closeModal = () => {
        setOpenAddAdmin(false);
        setOpenAddOffice(false);
        setOpenAddUser(false);
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
