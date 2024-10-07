"use client";

import {
    Box,
    Button,
    FormControl,
    Stack,
    FormLabel,
    Input,
    Textarea,
    Grid,
    Autocomplete,
    Checkbox,
    Modal,
    ModalDialog,
    Typography
} from "@mui/joy";
import { FormControlLabel, Radio, RadioGroup, Paper } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import { useRouter } from "next/navigation";

const AddItems = ({ session, isFoundItem }) => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [finder, setFinder] = useState(null);
    const [image, setImage] = useState(null);
    const [itemSurrendered, setItemSurrendered] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state
    const [countdown, setCountdown] = useState(5);

    // Fetch users based on session's school category
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/user');
                const data = await response.json();
                if (response.ok) {
                    const usersSchoolCategory = data.filter(user => user.schoolCategory === session.user.roleData.schoolCategory);
                    setUsers(usersSchoolCategory);
                } else {
                    console.error('Failed to fetch data.');
                }
            } catch (error) {
                console.error('Error occurred', error);
            }
        };

        if (session?.user?.roleData?.schoolCategory) {
            fetchUsers();
        }
    }, [session?.user?.roleData?.schoolCategory]);

    // Hook for the dropzone, always called unconditionally
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finderId = finder?.accountId || null;

        const [selectedHours, selectedMinutes] = time.split(":").map(Number);
        const selectedTimeInMinutes = selectedHours * 60 + selectedMinutes;

        const currentDate = new Date();
        const currentTimeInMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

        if (selectedTimeInMinutes > currentTimeInMinutes) {
            alert("Selected time cannot be later than the current time.");
            return;
        }

        const status = itemSurrendered ? "Published" : "Validating";

        const formData = {
            isFoundItem,
            officerId: session.user.id,
            name,
            category,
            description,
            location,
            date,
            time,
            finder: finderId,
            image,
            status,
        };

        const response = await fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        if (response.ok) {
            const result = await response.json();
            console.log("Item saved successfully:", result);
            setShowSuccessModal(true);
        } else {
            alert('Invalid');
            console.error('Failed to save item.');
        }
    };

    useEffect(() => {
        if (showSuccessModal) {
            const timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);

            // Redirect when countdown reaches 0
            if (countdown === 0) {
                router.push('/office/items');
            }

            // Clear interval when modal closes or component unmounts
            return () => clearInterval(timer);
        }
    }, [showSuccessModal, countdown, router]);

    return (
        <Box
            sx={{
                marginTop: "60px",
                marginLeft: { xs: "0px", lg: "250px" },
                padding: "20px",
                transition: "margin-left 0.3s ease",
            }}
        >
            <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid item xs={12} sm={10} md={8} lg={6}>
                    <Paper elevation={2} sx={{ padding: '1rem' }}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <FormControl fullWidth>
                                    <FormLabel>Name</FormLabel>
                                    <Input autoFocus required value={name} onChange={(e) => setName(e.target.value)} />
                                </FormControl>

                                <FormControl fullWidth>
                                    <FormLabel>Category</FormLabel>
                                    <RadioGroup
                                        row
                                        name="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    >
                                        <FormControlLabel value="Electronics" control={<Radio />} label="Electronics" />
                                        <FormControlLabel value="Clothing" control={<Radio />} label="Clothing" />
                                        <FormControlLabel value="Accessories" control={<Radio />} label="Accessories" />
                                    </RadioGroup>
                                </FormControl>

                                <FormControl fullWidth>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea minRows={4} required value={description} onChange={(e) => setDescription(e.target.value)} />
                                </FormControl>

                                <FormControl fullWidth>
                                    <FormLabel>Found Location</FormLabel>
                                    <Input required value={location} onChange={(e) => setLocation(e.target.value)} />
                                </FormControl>

                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <FormLabel>Date</FormLabel>
                                            <Input
                                                fullWidth
                                                required
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                slotProps={{
                                                    input: {
                                                        min: '2023-01-01',
                                                        max: new Date().toISOString().split('T')[0],
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <FormLabel>Time</FormLabel>
                                            <Input
                                                fullWidth
                                                required
                                                type="time"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <FormControl fullWidth>
                                    <FormLabel>Finder</FormLabel>
                                    <Autocomplete
                                        placeholder="Select a user"
                                        options={users || []}
                                        getOptionLabel={(user) => `${user.accountId} - ${user.firstname} ${user.lastname}`}
                                        value={finder}
                                        isOptionEqualToValue={(option, value) => option?.accountId === value?.accountId}
                                        onChange={(event, value) => {
                                            setFinder(value);
                                        }}
                                    />
                                </FormControl>

                                <FormControl fullWidth>
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

                                <FormControl fullWidth>
                                    <Checkbox
                                        label="Is the item already surrendered?"
                                        variant="soft"
                                        checked={itemSurrendered}
                                        onChange={(e) => setItemSurrendered(e.target.checked)}
                                    />
                                </FormControl>

                                <Button type="submit" fullWidth>Submit</Button>
                            </Stack>
                        </form>
                        <Modal open={showSuccessModal}>
                            <ModalDialog>
                                <Typography level="h3">Success!</Typography>
                                <Typography level="body1">
                                    Item has been added successfully. Redirecting in {countdown} seconds...
                                </Typography>
                                <Button onClick={() => router.push('/office/items')} sx={{ mt: 2 }}>
                                    Redirect now
                                </Button>
                            </ModalDialog>
                        </Modal>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AddItems;
