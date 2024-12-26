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

const AddRole = ({ open, onClose, refreshData, setOpenSnackbar, setMessage }) => {
    const [name, setName] = useState('');
    const [officeLocation, setOfficeLocation] = useState('');
    const [schoolCategory, setSchoolCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    // Define permissions as an object
    const [permissions, setPermissions] = useState({
        viewAdminsList: false,
        viewUsersList: false,
        viewRoles: false,
        manageRequestReportedFoundItems: false,
        manageRequestItemRetrieval: false,
        manageRequestReportedLostItems: false,
        manageBadges: false,
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
                setOpenSnackbar('success');
                setMessage('Role added successfully!');
            } else {
                const data = await response.json();
                setOpenSnackbar('danger');
                setMessage(`Failed to add role: ${data.error}`);
            }
        } catch (error) {
            setOpenSnackbar('danger');
            setMessage('An error occurred while adding the role.');
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
                                    placeholder="Select school category"
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
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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

                                <FormControl fullWidth>
                                    <FormGroup>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={permissions.manageBadges}
                                                onChange={(e) => handlePermissionChange('manageBadges', e.target.checked)}
                                            />
                                            <FormLabel sx={{ ml: 1 }}>Manage Badges</FormLabel>
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
                                Add Role
                            </Button>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>
        </>
    );
};

export default AddRole;