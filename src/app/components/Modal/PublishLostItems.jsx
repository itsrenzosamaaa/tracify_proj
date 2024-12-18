'use client'

import { Grid, Snackbar, DialogContent, Modal, ModalDialog, Stack, Typography, ModalClose, FormControl, FormLabel, Input, Autocomplete, Button, Box, Checkbox, Textarea, Select, Option } from '@mui/joy'
import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

const PublishLostItem = ({ open, onClose, fetchItems, setOpenSnackbar, setMessage, setActiveTab }) => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [color, setColor] = useState();
    const [size, setSize] = useState();
    const [category, setCategory] = useState();
    const [material, setMaterial] = useState();
    const [condition, setCondition] = useState();
    const [distinctiveMarks, setDistinctiveMarks] = useState();
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [lostDateStart, setLostDateStart] = useState('');
    const [lostDateEnd, setLostDateEnd] = useState('');
    const [images, setImages] = useState([]);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(false);
    const [itemWhereabouts, setItemWhereabouts] = useState(false);
    const { data: session, status } = useSession();

    const handleCheck = (e) => {
        const check = e.target.checked;
        setItemWhereabouts(check)

        if (check) {
            setLocation('');
            setLostDateStart('');
            setLostDateEnd('');
        } else {
            setLocation('Unidentified');
            setLostDateStart('Unidentified');
            setLostDateEnd('Unidentified');
        }
    }

    const locationOptions = ["RLO Building", "FJN Building", "MMN Building", 'Canteen', 'TLC Court', 'Function Hall', 'Library', 'Computer Laboratory'];

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
        if (status === 'authenticated' && session?.user?.schoolCategory && session?.user?.userType !== 'user') {
            fetchUsers();
        }
    }, [status, session?.user?.schoolCategory, session?.user?.userType, fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (images.length === 0) {
                setOpenSnackbar('danger');
                setMessage('Please upload at least one image.');
                return;
            }

            const selectedLostStartDate = new Date(lostDateStart);
            const selectedLostEndDate = new Date(lostDateEnd);

            let lostItemData = {
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
                images,
                status: session.user.userType === 'user' ? 'Request' : 'Missing',
            };

            if (lostItemData.status === 'Request') {
                lostItemData.dateRequest = new Date();
            } else {
                lostItemData.dateMissing = new Date();
            }

            const response = await fetch('/api/lost-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lostItemData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unexpected response format' }));
                setOpenSnackbar('danger');
                setMessage(`Failed to add found item: ${errorData.error}`)
            }

            const lostItemResponse = await response.json();

            const ownerData = {
                user: session?.user?.userType === 'user' ? session?.user?.id : owner?._id,
                item: lostItemResponse._id,
            };

            const lostResponse = await fetch('/api/owner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ownerData),
            });

            if (session?.user?.userType !== 'user') {
                await Promise.all([
                    fetch('/api/notification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            receiver: owner._id,
                            message: `The lost item (${name}) you reported to ${session.user.roleName} has been published!`,
                            type: 'Lost Items',
                            markAsRead: false,
                            dateNotified: new Date(),
                        }),
                    }),
                    fetch('/api/send-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            to: owner.emailAddress,
                            name: owner.firstname,
                            link: 'tracify-project.vercel.app',
                            success: false,
                            title: 'Lost Item Published Successfully!'
                        }),
                    }),
                ]);
            }

            resetForm();
            if (session?.user?.userType === 'user') setActiveTab('requested-item');
            setOpenSnackbar('success');
            setMessage(session?.user?.userType === 'user' ? 'Item requested successfully!' : 'Item published successfully!')
        } catch (error) {
            setOpenSnackbar('danger');
            setMessage('An unexpected error occurred.')
        } finally {
            setLoading(false)
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
        setLocation('');
        setLostDateStart('');
        setLostDateEnd('');
        setImages([]);
        setOwner(null);
        await fetchItems();
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
                    <Typography level="h4" sx={{ mb: 2 }}>{session?.user?.userType === 'user' ? 'Request' : 'Post'} Lost Item</Typography>
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
                            <Stack spacing={2}>
                                {
                                    session?.user?.userType !== 'user' &&
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
                                }
                                <FormControl>
                                    <FormLabel>Item Name</FormLabel>
                                    <Input required type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
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
                                <FormControl>
                                    <FormLabel>Item Description</FormLabel>
                                    <Textarea required type="text" name="description" minRows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                                </FormControl>
                                <FormControl>
                                    <Checkbox label="The owner knows the item's whereabouts" checked={itemWhereabouts} onChange={handleCheck} />
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
                                        <Grid container spacing={1}>
                                            {/* Start Date and Time */}
                                            <Grid item xs={12} md={6}>
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
                                            </Grid>

                                            <Grid item xs={12} md={6}>
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
                                            </Grid>
                                        </Grid>
                                    </>
                                }
                                <FormControl>
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
                                        <input {...getInputProps()} multiple style={{ display: 'none' }} />
                                        <p>
                                            {images.length === 0 && "Drag 'n' drop some files here, or click to select files"}
                                        </p>
                                    </Box>
                                </FormControl>
                                <Button disabled={loading} loading={loading} type="submit">{session?.user?.userType === 'user' ? 'Request' : 'Post'}</Button>
                            </Stack>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>
        </>
    )
}

export default PublishLostItem