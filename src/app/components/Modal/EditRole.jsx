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
    Select,
    Option
} from '@mui/joy';
import { FormGroup } from '@mui/material';

const EditRole = ({ open, onClose, refreshData, role, setMessage, setOpenSnackbar }) => {
    const [name, setName] = useState(role?.name || ''); // Default to an empty string if role or role.name is undefined
    const [officeLocation, setOfficeLocation] = useState(role?.office_location || ''); // Default to an empty string
    const [schoolCategory, setSchoolCategory] = useState(role?.school_category || ''); // Default to an empty string
    const [loading, setLoading] = useState(false); // Default to false

    // Initialize permissions with default values to avoid errors if role or role.permissions is undefined
    const [permissions, setPermissions] = useState({
        viewAdminsList: role?.permissions?.viewAdminsList || false,
        viewUsersList: role?.permissions?.viewUsersList || false,
        viewRoles: role?.permissions?.viewRoles || false,
        manageRequestReportedFoundItems: role?.permissions?.manageRequestReportedFoundItems || false,
        manageRequestItemRetrieval: role?.permissions?.manageRequestItemRetrieval || false,
        manageRequestReportedLostItems: role?.permissions?.manageRequestReportedLostItems || false,
        manageBadges: role?.permissions?.manageBadges || false,
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
            school_category: schoolCategory,
            permissions,
        };

        try {
            const response = await fetch(`/api/roles/${role._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roleData),
            });
            if (response.ok) {
                onClose();
                await refreshData();
                setOpenSnackbar('success');
                setMessage('Role updated successfully!');
            } else {
                const data = await response.json();
                setOpenSnackbar('danger');
                setMessage(`Failed to update role: ${data.error}`);
            }
        } catch (error) {
            setOpenSnackbar('danger');
            setMessage('An error occurred while updating the role.');
        } finally {
            setLoading(false)
        }
    };

    return (
        <>
            <Modal open={open === role._id} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" sx={{ mb: 2 }}>
                        Edit Role
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
                            <FormControl fullWidth sx={{ mb: 1 }}>
                                <FormLabel>Role Name</FormLabel>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter role name"
                                />
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 1 }}>
                                <FormLabel>Office Location</FormLabel>
                                <Input
                                    type="text"
                                    value={officeLocation}
                                    onChange={(e) => setOfficeLocation(e.target.value)}
                                    placeholder="Enter office location"
                                />
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 1 }}>
                                <FormLabel>School Category</FormLabel>
                                <Select
                                    placeholder="Select a role"
                                    value={schoolCategory} // Bind this to the selected role
                                    onChange={(e, newValue) => setSchoolCategory(newValue)} // Update state on change
                                >
                                    <Option value="Basic Education">Basic Education</Option>
                                    <Option value="Higher Education">Higher Education</Option>
                                </Select>
                            </FormControl>

                            {/* Permissions */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography level="h4" sx={{ mb: 2 }}>Permissions</Typography>

                                {/* Admin Permissions */}
                                <FormControl fullWidth>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={permissions.viewAdminsList}
                                                onChange={(e) => handlePermissionChange('viewAdminsList', e.target.checked)}
                                            />
                                            <FormLabel sx={{ ml: 1 }}>View Admins List</FormLabel>
                                        </Box>
                                    </FormGroup>
                                </FormControl>

                                {/* Student Permissions */}
                                <FormControl fullWidth>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={permissions.viewUsersList}
                                                onChange={(e) => handlePermissionChange('viewUsersList', e.target.checked)}
                                            />
                                            <FormLabel sx={{ ml: 1 }}>View Students List</FormLabel>
                                        </Box>
                                    </FormGroup>
                                </FormControl>

                                {/* Role Permissions */}
                                <FormControl fullWidth>
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
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={permissions.manageBadges}
                                                    onChange={(e) => handlePermissionChange('manageBadges', e.target.checked)}
                                                />
                                                <FormLabel sx={{ ml: 1 }}>Manage Badges</FormLabel>
                                            </Box>
                                        </Box>
                                    </FormGroup>
                                </FormControl>

                                {/* Additional Permissions */}
                                <FormControl fullWidth>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={permissions.manageRequestReportedFoundItems}
                                                onChange={(e) => handlePermissionChange('manageRequestReportedFoundItems', e.target.checked)}
                                            />
                                            <FormLabel sx={{ ml: 1 }}>Manage Reported Found Items</FormLabel>
                                        </Box>
                                    </FormGroup>
                                </FormControl>

                                <FormControl fullWidth>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={permissions.manageRequestReportedLostItems}
                                                onChange={(e) => handlePermissionChange('manageRequestReportedLostItems', e.target.checked)}
                                            />
                                            <FormLabel sx={{ ml: 1 }}>Manage Reported Lost Items</FormLabel>
                                        </Box>
                                    </FormGroup>
                                </FormControl>

                                <FormControl fullWidth>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={permissions.manageRequestItemRetrieval}
                                                onChange={(e) => handlePermissionChange('manageRequestItemRetrieval', e.target.checked)}
                                            />
                                            <FormLabel sx={{ ml: 1 }}>Manage Item Retrieval</FormLabel>
                                        </Box>
                                    </FormGroup>
                                </FormControl>

                            </Box>

                            {/* Submit Button */}
                            <Button sx={{ mt: 3 }} type="submit" loading={loading} disabled={loading}>
                                Update Role
                            </Button>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>
        </>
    );
};

export default EditRole;