'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Input,
    Button,
    FormLabel,
    Checkbox,
    FormControl,
    ModalDialog,
    ModalClose,
    DialogContent,
    Modal,
    Snackbar,
} from '@mui/joy';
import { FormGroup } from '@mui/material';

const AddRole = ({ open, onClose }) => {
    const [name, setName] = useState('');
    const [officeLocation, setOfficeLocation] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [loading, setLoading] = useState(false);

    // Define permissions as an object
    const [permissions, setPermissions] = useState({
        viewAdminsList: false,
        viewStudentsList: false,
        viewRoles: false,
        addRole: false,
        editRole: false,
        deleteRole: false,
        manageRequestReportedFoundItems: false,
        manageRequestItemRetrieval: false,
        manageRequestReportedLostItems: false,
        viewBadges: false,
        addBadge: false,
        editBadge: false,
        deleteBadge: false,
    });

    const handlePermissionChange = (perm, checked) => {
        setPermissions((prevPermissions) => {
            const updatedPermissions = { ...prevPermissions, [perm]: checked };
            return updatedPermissions;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        const roleData = {
            name,
            office_location: officeLocation,
            permissions,
        };

        try {
            const response = await fetch('/api/roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roleData),
            });
            if (response.ok) {
                onClose();
                await refreshData();
                setOpenSnackbar(true);
            } else {
                const data = await response.json();
                alert(`Failed to add role: ${data.error}`);
            }
        } catch (error) {
            console.error('Error adding role:', error);
            alert('An error occurred while adding the role.');
        } finally {
            setLoading(false)
        }
    };

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" sx={{ mb: 2 }}>
                        Add Role
                    </Typography>
                    <DialogContent
                        sx={{
                            overflowX: 'hidden',
                            overflowY: 'auto', // Allows vertical scrolling
                            '&::-webkit-scrollbar': { display: 'none' }, // Hides scrollbar in WebKit-based browsers (Chrome, Edge, Safari)
                            '-ms-overflow-style': 'none', // Hides scrollbar in IE and Edge
                            'scrollbar-width': 'none', // Hides scrollbar in Firefox
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            {/* Role Name Input */}
                            <FormControl fullWidth>
                                <FormLabel>Role Name</FormLabel>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter role name"
                                />
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <FormLabel>Office Location</FormLabel>
                                <Input
                                    type="text"
                                    value={officeLocation}
                                    onChange={(e) => setOfficeLocation(e.target.value)}
                                    placeholder="Enter office location"
                                />
                            </FormControl>

                            {/* Permissions */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography level="h4" sx={{ mb: 2 }}>Permissions</Typography>

                                {/* Admin Permissions */}
                                <FormControl fullWidth>
                                    <FormLabel>Admin Permissions</FormLabel>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={permissions.viewAdminsList}
                                                    onChange={(e) => handlePermissionChange('viewAdminsList', e.target.checked)}
                                                />
                                                <FormLabel sx={{ ml: 1 }}>View Admins List</FormLabel>
                                            </Box>
                                        </Box>
                                    </FormGroup>
                                </FormControl>

                                {/* Student Permissions */}
                                <FormControl fullWidth>
                                    <FormLabel>Student Permissions</FormLabel>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={permissions.viewStudentsList}
                                                    onChange={(e) => handlePermissionChange('viewStudentsList', e.target.checked)}
                                                />
                                                <FormLabel sx={{ ml: 1 }}>View Students List</FormLabel>
                                            </Box>
                                        </Box>
                                    </FormGroup>
                                </FormControl>

                                {/* Role Permissions */}
                                <FormControl fullWidth>
                                    <FormLabel>Role Permissions</FormLabel>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={permissions.viewRoles}
                                                    onChange={(e) => handlePermissionChange('viewRoles', e.target.checked)}
                                                />
                                                <FormLabel sx={{ ml: 1 }}>View Roles</FormLabel>
                                            </Box>
                                        </Box>
                                    </FormGroup>
                                </FormControl>

                                {/* Badge Permissions */}
                                <FormControl fullWidth>
                                    <FormLabel>Badge Permissions</FormLabel>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={permissions.viewBadges}
                                                    onChange={(e) => handlePermissionChange('viewBadges', e.target.checked)}
                                                />
                                                <FormLabel sx={{ ml: 1 }}>View Badges</FormLabel>
                                            </Box>
                                        </Box>
                                    </FormGroup>
                                </FormControl>

                                {/* Additional Permissions */}
                                <FormControl fullWidth>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={permissions.manageRequestReportedFoundItems}
                                                    onChange={(e) => handlePermissionChange('manageRequestReportedFoundItems', e.target.checked)}
                                                />
                                                <FormLabel sx={{ ml: 1 }}>Manage Reported Found Items</FormLabel>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={permissions.manageRequestReportedLostItems}
                                                    onChange={(e) => handlePermissionChange('manageRequestReportedLostItems', e.target.checked)}
                                                />
                                                <FormLabel sx={{ ml: 1 }}>Manage Reported Lost Items</FormLabel>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={permissions.manageRequestItemRetrieval}
                                                    onChange={(e) => handlePermissionChange('manageRequestItemRetrieval', e.target.checked)}
                                                />
                                                <FormLabel sx={{ ml: 1 }}>Manage Item Retrieval</FormLabel>
                                            </Box>
                                        </Box>
                                    </FormGroup>
                                </FormControl>
                            </Box>

                            {/* Submit Button */}
                            <Button sx={{ mt: 3 }} type="submit" loading={loading} disabled={loading}>
                                Add Role
                            </Button>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>
            <Snackbar
                autoHideDuration={5000}
                open={openSnackbar}
                variant="solid"
                color="success"
                onClose={(event, reason) => {
                    if (reason === 'clickaway') {
                        return;
                    }
                    setOpenSnackbar(false);
                }}
            >
                Role added successfully!
            </Snackbar>
        </>
    );
};

export default AddRole;