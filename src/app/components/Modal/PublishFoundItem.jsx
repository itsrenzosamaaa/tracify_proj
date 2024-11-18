'use client'

import { Snackbar, Textarea, DialogContent, Modal, ModalDialog, Stack, Typography, ModalClose, FormControl, FormLabel, Input, Autocomplete, Button, Box, Checkbox, Select, Option } from '@mui/joy'
import React, { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { format, subDays, isBefore, isAfter } from 'date-fns';
import Link from 'next/link';

const PublishFoundItem = ({ open, onClose, fetchItems = null, inDashboard = null }) => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [color, setColor] = useState();
    const [size, setSize] = useState();
    const [category, setCategory] = useState();
    const [material, setMaterial] = useState();
    const [condition, setCondition] = useState();
    const [distinctiveMarks, setDistinctiveMarks] = useState();
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [foundDate, setFoundDate] = useState('');
    const [image, setImage] = useState(null);
    const [userFindItem, setUserFindItem] = useState(false);
    const [finder, setFinder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const { data: session, status } = useSession();

    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            const filteredUsers = data.filter(user => user.school_category === session?.user?.schoolCategory);
            setUsers(filteredUsers);
        } catch (error) {
            console.error(error);
        }
    }, [session?.user?.schoolCategory]);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.schoolCategory) {
            fetchUsers();
        }
    }, [status, session?.user?.schoolCategory, fetchUsers]);

    useEffect(() => {
        if (!userFindItem) setFinder('');
    }, [userFindItem]);

    const locationOptions = ["RLO Building", "FJN Building", "MMN Building", 'Canteen', 'TLC Court'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);
        const selectedDate = new Date(foundDate);

        if (isBefore(selectedDate, thirtyDaysAgo)) {
            alert('The found date should be within the last 30 days.');
            setLoading(false);
            return;
        }

        if (isAfter(selectedDate, now)) {
            alert('The found date cannot be in the future.');
            setLoading(false);
            return;
        }

        // Create found item data with lost item ID as the owner
        const foundItemData = {
            isFoundItem: true,
            name,
            color,
            size,
            category,
            material,
            condition,
            distinctiveMarks,
            description,
            location,
            date_time: format(selectedDate, 'MMMM dd,yyyy hh:mm a'),
            image,
            status: 'Published',
            datePublished: new Date(),
            monitoredBy: session?.user?.id,
        };

        try {
            const response = await fetch('/api/found-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(foundItemData),
            });

            if (response.ok) {
                const foundItemResponse = await response.json();

                const finderData = {
                    user: userFindItem ? finder?._id : session?.user?.id,
                    item: foundItemResponse._id,
                };

                const foundResponse = await fetch('/api/finder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finderData),
                });

                if (foundResponse.ok) {
                    await resetForm(); // Ensure resetForm is defined to clear form inputs
                    setOpenSnackbar(true);
                } else {
                    const data = await foundResponse.json().catch(() => ({ error: "Unexpected response format" }));
                    alert(`Failed to add finder: ${data.error}`);
                }
            } else {
                const data = await response.json().catch(() => ({ error: "Unexpected response format" }));
                alert(`Failed to add found item: ${data.error}`);
            }
        } catch (error) {
            console.error("Error creating found item:", error);
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to reset form fields and close the modal
    const resetForm = async () => {
        await onClose();
        setName('');
        setColor();
        setSize();
        setCategory();
        setMaterial();
        setCondition();
        setDistinctiveMarks();
        setDescription('');
        setLocation(null);
        setFoundDate('');
        setImage(null);
        setUserFindItem(false);
        setFinder(null);
        if(fetchItems) await fetchItems();
    };


    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0]; // Get the first selected file
        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/png'];
            if (validImageTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImage(reader.result); // Set the image state to the base64 URL for preview
                };
                reader.readAsDataURL(file); // Convert the file to base64 URL
            } else {
                alert('Please upload a valid image file (JPEG, PNG, GIF)');
                setImage(null);
            }
        } else {
            setImage(null);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    if (status === 'loading') return null;

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <ModalDialog
                    sx={{
                        maxWidth: '600px', // Adjust to your desired width
                        width: '90%', // Ensures responsiveness on smaller screens
                    }}
                >
                    <ModalClose />
                    <Typography level="h4" sx={{ mb: 2 }}>Publish a Found Item</Typography>
                    <DialogContent sx={{ overflowX: 'hidden' }}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <FormControl>
                                    <Checkbox label="Did the user find this item?" checked={userFindItem} onChange={(e) => setUserFindItem(e.target.checked)} />
                                </FormControl>
                                {userFindItem && (
                                    <FormControl required>
                                        <FormLabel>Finder</FormLabel>
                                        <Autocomplete
                                            placeholder="Select a finder"
                                            options={users || []}
                                            value={finder}
                                            onChange={(event, value) => {
                                                setFinder(value);
                                            }}
                                            getOptionLabel={(user) => {
                                                return user ? `${user.firstname} ${user.lastname}` : 'No Options';
                                            }}
                                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                                        />
                                    </FormControl>
                                )}
                                <FormControl required>
                                    <FormLabel>Item Name</FormLabel>
                                    <Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                                </FormControl>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Box sx={{ width: '100%' }}>
                                        <FormControl>
                                            <FormLabel>Color</FormLabel>
                                            <Select
                                                fullWidth
                                                required
                                                value={color}
                                                onChange={(e, value) => setColor(value)}
                                                displayEmpty
                                            >
                                                <Option value="" disabled>
                                                    Select Color
                                                </Option>
                                                {['Black', 'White', 'Blue', 'Red', 'Brown'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Box sx={{ width: '100%' }}>
                                        <FormControl>
                                            <FormLabel>Size</FormLabel>
                                            <Select
                                                required
                                                value={size}
                                                onChange={(e, value) => setSize(value)}
                                                displayEmpty
                                            >
                                                <Option value="" disabled>
                                                    Select Size
                                                </Option>
                                                {['Small', 'Medium', 'Large'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Box sx={{ width: '100%' }}>
                                        <FormControl>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                required
                                                value={category}
                                                onChange={(e, value) => setCategory(value)}
                                                displayEmpty
                                            >
                                                <Option value="" disabled>
                                                    Select Category
                                                </Option>
                                                {['Electronics', 'Clothing', 'Accessories'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Box sx={{ width: '100%' }}>
                                        <FormControl>
                                            <FormLabel>Material</FormLabel>
                                            <Select
                                                required
                                                value={material}
                                                onChange={(e, value) => setMaterial(value)}
                                                displayEmpty
                                            >
                                                <Option value="" disabled>
                                                    Select Material
                                                </Option>
                                                {['Leather', 'Metal', 'Plastic', 'Fabric'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Box sx={{ width: '100%' }}>
                                        <FormControl>
                                            <FormLabel>Condition</FormLabel>
                                            <Select
                                                required
                                                value={condition}
                                                onChange={(e, value) => setCondition(value)}
                                                displayEmpty
                                            >
                                                <Option value="" disabled>
                                                    Select Condition
                                                </Option>
                                                {['New', 'Damaged', 'Old'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Box sx={{ width: '100%' }}>
                                        <FormControl>
                                            <FormLabel>Distinctive Marks</FormLabel>
                                            <Select
                                                required
                                                value={distinctiveMarks}
                                                onChange={(e, value) => setDistinctiveMarks(value)}
                                                displayEmpty
                                            >
                                                <Option value="" disabled>
                                                    Select Distinctive Marks
                                                </Option>
                                                {['None', 'Scratches', 'Stickers', 'Initials', 'Keychain'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>
                                <FormControl required>
                                    <FormLabel>Item Description</FormLabel>
                                    <Textarea type="text" name="description" minRows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                                </FormControl>
                                <FormControl required>
                                    <FormLabel>Found Location</FormLabel>
                                    <Autocomplete
                                        placeholder="Select a location"
                                        options={locationOptions}
                                        value={location}
                                        onChange={(event, value) => {
                                            setLocation(value);
                                            console.log('Selected location:', value);
                                        }}
                                        getOptionLabel={(option) => option}
                                    />
                                </FormControl>
                                <FormControl required>
                                    <FormLabel>Found Date and Time</FormLabel>
                                    <Input
                                        type="datetime-local"
                                        name="foundDate"
                                        value={foundDate}
                                        onChange={(e) => setFoundDate(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl required>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <FormLabel>Upload Image</FormLabel>
                                        {image && <Button size="sm" color="danger" onClick={() => setImage(null)}>Discard</Button>}
                                    </Box>
                                    {!image ? (
                                        <Box
                                            {...getRootProps({ className: 'dropzone' })}
                                            sx={{
                                                border: '2px dashed #888',
                                                borderRadius: '4px',
                                                padding: '20px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: image ? 'transparent' : '#f9f9f9',
                                            }}
                                        >
                                            <input {...getInputProps()} />
                                            <p>{image ? "Image Selected" : "Drag 'n' drop some files here, or click to select files"}</p>
                                        </Box>
                                    ) : (
                                        <Image
                                            src={image}
                                            width={0}
                                            height={0}
                                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            style={{ width: '100%', height: 'auto', objectFit: 'cover', marginBottom: '1rem' }}
                                            alt="Preview"
                                        />
                                    )}
                                </FormControl>
                                <Button loading={loading} disabled={loading} type="submit">Publish</Button>
                            </Stack>
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
                <div>
                    Item published successfully!{' '}
                    {inDashboard && (
                        <Link href="/found-items" style={{ color: 'inherit', textDecoration: 'underline' }}>
                            Click here
                        </Link>
                    )}{' '}
                    to redirect to the found items list.
                </div>
            </Snackbar>

        </>
    )
}

export default PublishFoundItem