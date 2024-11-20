'use client'

import { Snackbar, DialogContent, Modal, ModalDialog, Stack, Typography, ModalClose, FormControl, FormLabel, Input, Autocomplete, Button, Box, Checkbox, Textarea, Select, Option } from '@mui/joy'
import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import Link from 'next/link';

const PublishLostItem = ({ open, onClose, fetchItems = null, inDashboard = null }) => {
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
    const [lostDateStart, setLostDateStart] = useState('');
    const [lostDateEnd, setLostDateEnd] = useState('');
    const [images, setImages] = useState([]);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [itemWhereabouts, setItemWhereabouts] = useState(false);
    const { data: session, status } = useSession();

    const locationOptions = ["RLO Building", "FJN Building", "MMN Building", 'Canteen', 'TLC Court'];

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedLostStartDate = new Date(lostDateStart);
        const selectedLostEndDate = new Date(lostDateEnd);

        const lostItemData = {
            isFoundItem: false,
            name,
            color,
            size,
            category,
            material,
            condition,
            distinctiveMarks,
            description,
            location: itemWhereabouts ? location : 'Unidentified',
            date_time: itemWhereabouts ? `${format(selectedLostStartDate, 'MMMM dd, yyyy hh:mm a')} to ${format(selectedLostEndDate, 'MMMM dd, yyyy hh:mm a')}` : 'Unidentified',
            image,
            status: 'Missing',
            dateMissing: new Date(),
        };

        try {
            const response = await fetch('/api/lost-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lostItemData),
            });
            if (response.ok) {
                const lostItemResponse = await response.json();

                const ownerData = {
                    user: owner?._id,
                    item: lostItemResponse._id,
                };

                const lostResponse = await fetch('/api/owner', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ownerData),
                });

                if (lostResponse.ok) {
                    await resetForm(); // Ensure resetForm is defined to clear form inputs
                    setOpenSnackbar(true);
                } else {
                    const data = await lostResponse.json().catch(() => ({ error: "Unexpected response format" }));
                    alert(`Failed to add owner: ${data.error}`);
                }
            } else {
                const data = await response.json();
                alert(`Failed to add lost item: ${data.error}`);
            }
        } catch (error) {
            console.error('Error adding lost item:', error);
            alert('An error occurred while adding the lost item.');
        }
    };

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
        setLostDateStart('');
        setLostDateEnd('');
        setImage(null);
        setOwner(null);
        if (fetchItems) await fetchItems();
    };

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setLostDateStart(newStartDate);

        // Automatically set end date to the same day as the start date
        if (newStartDate) {
            const sameDayEndDate = new Date(newStartDate);
            sameDayEndDate.setHours(23, 59, 59); // Set to the end of the day
            setLostDateEnd(sameDayEndDate.toISOString().slice(0, 16)); // Format the date to match input type="datetime-local"
        }
    };

    // Ensure that end date stays on the same day as the start date if it's manually changed
    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setLostDateEnd(newEndDate);

        if (newEndDate && lostDateStart) {
            const startDate = new Date(lostDateStart);
            const endDate = new Date(newEndDate);

            if (startDate >= endDate) {
                alert("The start time must be earlier than the end time.");
                setLostDateStart('');
                setLostDateEnd('');
            }
        }
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
        accept: 'image/jpeg, image/png, image/gif', // Restrict file types
        multiple: true,
    });

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index)); // Remove image by index
    };

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
                    <Typography level="h4" sx={{ mb: 2 }}>Publish a Lost Item</Typography>
                    <DialogContent sx={{ overflowX: 'hidden' }}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <FormControl>
                                    <FormLabel>Owner</FormLabel>
                                    <Autocomplete
                                        required
                                        placeholder='Select owner'
                                        options={users || []}  // Ensure users is an array
                                        value={owner}  // Ensure value corresponds to an option in users
                                        onChange={(event, value) => {
                                            setOwner(value); // Update state with selected user
                                        }}
                                        getOptionLabel={(user) => {
                                            if (!user || !user.firstname || !user.lastname) {
                                                return 'No Options'; // Safeguard in case user data is undefined
                                            }
                                            return `${user.firstname} ${user.lastname}`; // Correctly format user names
                                        }}
                                        isOptionEqualToValue={(option, value) => option.id === value?.id} // Ensure comparison by unique identifier
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Item Name</FormLabel>
                                    <Input required type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
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
                                <FormControl>
                                    <FormLabel>Item Description</FormLabel>
                                    <Textarea required type="text" name="description" minRows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                                </FormControl>
                                <FormControl>
                                    <Checkbox label="The owner knows the item's location" checked={itemWhereabouts} onChange={(e) => setItemWhereabouts(e.target.checked)} />
                                </FormControl>
                                {
                                    itemWhereabouts &&
                                    <>
                                        <FormControl required>
                                            <FormLabel>Lost Location</FormLabel>
                                            <Autocomplete
                                                required
                                                placeholder="Select a location"
                                                options={locationOptions}
                                                value={location}
                                                onChange={(event, value) => {
                                                    setLocation(value); // Update state with selected user
                                                }}
                                                getOptionLabel={(option) => option}
                                            />
                                        </FormControl>
                                        <Box display="flex" gap={2}>
                                            {/* Start Date and Time */}
                                            <FormControl required>
                                                <FormLabel>Start Date and Time</FormLabel>
                                                <Input
                                                    fullWidth
                                                    required
                                                    type="datetime-local" // Ensures the input is a date-time picker
                                                    name="lostDateStart"
                                                    value={lostDateStart} // State holding the start date-time value
                                                    onChange={handleStartDateChange} // Update state with the selected date-time
                                                />
                                            </FormControl>

                                            {/* End Date and Time */}
                                            <FormControl required>
                                                <FormLabel>End Date and Time</FormLabel>
                                                <Input
                                                    fullWidth
                                                    required
                                                    type="datetime-local" // Ensures the input is a date-time picker
                                                    name="lostDateEnd"
                                                    value={lostDateEnd} // State holding the end date-time value
                                                    onChange={handleEndDateChange} // Update state with the selected date-time
                                                />
                                            </FormControl>
                                        </Box>
                                    </>
                                }
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
                                        {images.length > 0 && (
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
                                        <input {...getInputProps()} multiple />
                                        <p>
                                            {images.length === 0 && "Drag 'n' drop some files here, or click to select files"}
                                        </p>
                                    </Box>
                                </FormControl>
                                <Button disabled={loading} loading={loading} type="submit">Publish</Button>
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
                        <Link href="/lost-items" style={{ color: 'inherit', textDecoration: 'underline' }}>
                            Click here
                        </Link>
                    )}{' '}
                    to redirect to the lost items list.
                </div>
            </Snackbar>
        </>
    )
}

export default PublishLostItem