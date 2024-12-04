'use client'

import { Grid, Snackbar, Textarea, DialogContent, Modal, ModalDialog, Stack, Typography, ModalClose, FormControl, FormLabel, Input, Autocomplete, Button, Box, Checkbox, Select, Option } from '@mui/joy'
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
    const [images, setImages] = useState([]);
    const [finder, setFinder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const { data: session, status } = useSession();

    console.log(finder)

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

    const locationOptions = ["RLO Building", "FJN Building", "MMN Building", 'Canteen', 'TLC Court', 'Function Hall', 'Library', 'Computer Laboratory'];

    // const floorBuilding = ['1st Floor', '2nd Floor', '3rd Floor'];

    // const specificBuildingLocations = ['Hallway', 'Inside the Room', 'Restroom'];

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
            images,
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
                    user: finder?._id,
                    item: foundItemResponse._id,
                };

                const foundResponse = await fetch('/api/finder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finderData),
                });

                const notificationResponse = await fetch('/api/notification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        receiver: finder._id,
                        message: `The found item (${name}) you reported to ${session.user.roleName} has been published!`,
                        type: 'Found Items',
                        markAsRead: false,
                        dateNotified: new Date(),
                    }),
                });

                const mailResponse = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: finder.emailAddress,
                        name: finder.firstname,
                        link: 'tracify-project.vercel.app',
                        success: true,
                        title: 'Found Item Published Successfully!'
                    }),
                });

                if (foundResponse.ok && mailResponse.ok && notificationResponse.ok) {
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
        setImages([]);
        setFinder(null);
        if (fetchItems) await fetchItems();
    };


    const onDrop = (acceptedFiles) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif']; // Valid image types

        const newImages = acceptedFiles
            .filter((file) => validImageTypes.includes(file.type)) // Filter valid image files
            .map((file) => {
                const reader = new FileReader();
                return new Promise((resolve) => {
                    reader.onloadend = () => {
                        resolve(reader.result); // Resolve the base64 URL
                    };
                    reader.readAsDataURL(file); // Convert file to base64 URL
                });
            });

        Promise.all(newImages).then((base64Images) => {
            setImages((prev) => [...prev, ...base64Images]); // Add new images to the state
        });
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/gif': [],
        },
        multiple: true,
        required: true,
    });

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index)); // Remove image by index
    };

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
                                <FormControl required>
                                    <FormLabel>Item Name</FormLabel>
                                    <Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                                </FormControl>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl>
                                            <FormLabel>Color</FormLabel>
                                            <Select
                                                fullWidth
                                                required
                                                value={color}
                                                onChange={(e, value) => setColor(value)}
                                            >
                                                <Option value="" disabled>
                                                    Select Color
                                                </Option>
                                                {['Black', 'White', 'Blue', 'Red', 'Brown', 'Yellow', 'Green', 'Orange', 'Violet', 'Pink', 'Gray', 'Cyan', 'Beige', 'Gold', 'Silver'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}

                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <FormControl>
                                            <FormLabel>Size</FormLabel>
                                            <Select
                                                required
                                                value={size}
                                                onChange={(e, value) => setSize(value)}
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
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <FormControl>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                required
                                                value={category}
                                                onChange={(e, value) => setCategory(value)}
                                            >
                                                <Option value="" disabled>
                                                    Select Category
                                                </Option>
                                                {['Electronics', 'Clothing', 'Accessories', 'School Supplies', 'Books', 'Tools', 'Sports Equipment'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl>
                                            <FormLabel>Material</FormLabel>
                                            <Select
                                                required
                                                value={material}
                                                onChange={(e, value) => setMaterial(value)}
                                            >
                                                <Option value="" disabled>
                                                    Select Material
                                                </Option>
                                                {['Leather', 'Metal', 'Plastic', 'Fabric', 'Wood', 'Glass', 'Ceramic', 'Stone', 'Rubber', 'Silicone', 'Paper', 'Wool', 'Cotton', 'Nylon'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl>
                                            <FormLabel>Condition</FormLabel>
                                            <Select
                                                required
                                                value={condition}
                                                onChange={(e, value) => setCondition(value)}
                                            >
                                                <Option value="" disabled>
                                                    Select Condition
                                                </Option>
                                                {['New', 'Damaged', 'Old', 'Used', 'Broken', 'Worn'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl>
                                            <FormLabel>Distinctive Marks</FormLabel>
                                            <Select
                                                required
                                                value={distinctiveMarks}
                                                onChange={(e, value) => setDistinctiveMarks(value)}
                                            >
                                                <Option value="" disabled>
                                                    Select Distinctive Marks
                                                </Option>
                                                {['None', 'Scratches', 'Stickers', 'Initials', 'Keychain', 'Dents', 'Stains', 'Fading', 'Pen Marks'].map((name) => (
                                                    <Option key={name} value={name}>
                                                        {name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
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
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            mb: 1,
                                        }}
                                    >
                                        <FormLabel>Upload Images</FormLabel>
                                        {images?.length > 0 && (
                                            <Button
                                                size="sm"
                                                color="danger"
                                                onClick={() => setImages([])} // Clear all images
                                            >
                                                Discard All
                                            </Button>
                                        )}
                                    </Box>
                                    <Box
                                        {...getRootProps({ className: 'dropzone' })}
                                        sx={{
                                            border: '2px dashed #888',
                                            borderRadius: '4px',
                                            padding: '20px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: '#f9f9f9',
                                            mb: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                                gap: '10px',
                                            }}
                                        >
                                            {images.map((image, index) => (
                                                <Box key={index} sx={{ position: 'relative' }}>
                                                    <Image
                                                        src={image}
                                                        width={0}
                                                        height={0}
                                                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        style={{
                                                            width: '100%',
                                                            height: 'auto',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px',
                                                        }}
                                                        alt={`Preview ${index + 1}`}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '5px',
                                                            right: '5px',
                                                            minWidth: 'unset',
                                                            padding: '2px',
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeImage(index);
                                                        }}
                                                    >
                                                        ✕
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                        <input {...getInputProps()} />
                                        <p>
                                            {images.length === 0 && "Drag 'n' drop some files here, or click to select files"}
                                        </p>
                                    </Box>
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
                        <Typography>
                            <Link href="/found-items" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                Click here
                            </Link>
                            to redirect to found items page.
                        </Typography>
                    )}
                </div>
            </Snackbar>

        </>
    )
}

export default PublishFoundItem