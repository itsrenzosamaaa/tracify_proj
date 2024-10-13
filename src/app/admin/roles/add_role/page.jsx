'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Input,
    Button,
    FormLabel,
    Grid,
    Card,
    CardContent,
    Checkbox,
    Select,
    Option
} from '@mui/joy';
import { useRouter } from 'next/navigation';

const AddRole = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [userType, setUserType] = useState(null);
    const [schoolCategory, setSchoolCategory] = useState(null);

    // Define permissions as an object
    const [permissions, setPermissions] = useState({
        viewUserList: false,
        addUser: false,
        editUser: false,
        deleteUser: false,
        viewRoles: false,
        addRole: false,
        editRole: false,
        deleteRole: false,
        viewItemCategories: false,
        addItemCategory: false,
        editItemCategory: false,
        deleteItemCategory: false,
        viewAdminDashboard: false,
        viewOfficerDashboard: false,
        viewUserDashboard: false,
        viewUserProfile: false,
        editUserProfile: false,
        monitorItems: false,
        publishItems: false,
        reportItems: false,
        matchItems: false,
        viewRequestReportedItems: false,
        viewRequestItemRetrieval: false,
        viewBadges: false,
        addBadge: false,
        updateBadge: false,
        deleteBadge: false,
        awardBadgesToUser: false,
        removeBadgesToUser: false,
        viewRatings: false,
        addRatings: false,
        updateRatings: false,
        deleteRatings: false,
    });

    const handlePermissionChange = (perm, checked) => {
        setPermissions((prevPermissions) => ({
            ...prevPermissions,
            [perm]: checked, // Update the permission with the new checked state
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const roleData = {
            name,
            userType,
            schoolCategory,
            permissions,
        };

        console.log(roleData);

        try {
            const response = await fetch('/api/roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roleData),
            });
            if (response.ok) {
                alert('success')
                return router.push('/admin/roles');
            } else {
                const data = await response.json();
                alert(`Failed to add role: ${data.error}`);
            }
        } catch (error) {
            console.error('Error adding role:', error);
            alert('An error occurred while adding the role.');
        }
    };

    return (
        <Box
            sx={{
                marginTop: '60px',
                marginLeft: { xs: '0px', lg: '250px' },
                padding: '20px',
                transition: 'margin-left 0.3s ease',
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} lg={8} sx={{ margin: '0 auto' }}>
                    <Typography level="h4" sx={{ textAlign: 'left', marginBottom: 2 }}>
                        Add Role
                    </Typography>

                    <Card sx={{ padding: "1.5rem", borderRadius: '8px' }}>
                        <form onSubmit={handleSubmit}>
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {/* Role Name Input */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <FormLabel sx={{ fontSize: '1rem', minWidth: '80px' }}>Name</FormLabel>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter role name"
                                            sx={{ flex: 1 }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <FormLabel sx={{ fontSize: '1rem', minWidth: '80px' }}>User Type</FormLabel>
                                        <Select
                                            name="userType"
                                            value={userType}
                                            onChange={(e, newValue) => setUserType(newValue)} // MUI Joy passes the value as the second parameter
                                            placeholder="Select User Type"
                                            sx={{ flex: 1 }}
                                        >
                                            <Option value="Admin">Admin</Option>
                                            <Option value="Officer">Officer</Option>
                                            <Option value="User">User</Option>
                                        </Select>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <FormLabel sx={{ fontSize: '1rem', minWidth: '80px' }}>School Category</FormLabel>
                                        <Select
                                            name="schoolCategory"
                                            value={schoolCategory}
                                            onChange={(e, newValue) => setSchoolCategory(newValue)} // MUI Joy passes the value as the second parameter
                                            placeholder="Select School Category"
                                            sx={{ flex: 1 }}
                                        >
                                            <Option value="All">All</Option>
                                            <Option value="Basic Department">Basic Department</Option>
                                            <Option value="Higher Department">Higher Department</Option>
                                        </Select>
                                    </Box>

                                    {/* Permissions Inputs */}
                                    <Box>
                                        <Typography level="h5" sx={{ marginBottom: 1 }}>
                                            Permissions
                                        </Typography>
                                        {Object.keys(permissions).map((perm) => (
                                            <Box key={perm} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    name={perm}
                                                    checked={permissions[perm]}
                                                    onChange={(e) => handlePermissionChange(perm, e.target.checked)}
                                                />
                                                <FormLabel sx={{ marginLeft: 1, mb: 1 }}>
                                                    {perm.replace(/([A-Z])/g, ' $1')}
                                                </FormLabel>
                                            </Box>
                                        ))}
                                    </Box>

                                    {/* Submit Button */}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <Button
                                            type="submit"
                                        >
                                            Add Role
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </form>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AddRole;
