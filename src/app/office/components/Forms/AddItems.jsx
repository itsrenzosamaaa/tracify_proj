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
import dayjs from "dayjs";

const AddItems = ({ session, isFoundItem }) => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [finder, setFinder] = useState(null);
    const [owner, setOwner] = useState(null);
    const [image, setImage] = useState(null);
    const [itemSurrendered, setItemSurrendered] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state
    const [countdown, setCountdown] = useState(5);
    const [loading, setLoading] = useState(false);

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

    console.log(dateTime)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate if the selected date is within the past 30 days
        const currentDate = new Date();
        const selectedDate = new Date(dateTime);

        // Calculate the difference in days
        const timeDifference = currentDate.getTime() - selectedDate.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24); // Difference in days

        // Check for past dates
        if (daysDifference > 30) {
            alert("Selected date cannot be more than 30 days in the past.");
            setLoading(false);
            return;
        }

        // Check if the selected time is later than the current time on the same day
        const selectedTimeParts = dateTime.split(":").map(Number);
        const selectedTimeInMinutes = selectedTimeParts[0] * 60 + selectedTimeParts[1];
        const currentTimeInMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

        if (selectedDate.toDateString() === currentDate.toDateString() && selectedTimeInMinutes > currentTimeInMinutes) {
            alert("Selected time cannot be later than the current time.");
            setLoading(false);
            return;
        }

        // Prepare the formData for submission
        const finderId = finder?.accountId || null;
        const ownerId = owner?.accountId || null
        const status = !isFoundItem ? "Missing" : itemSurrendered ? "Published" : "Validating";

        const formData = {
            isFoundItem,
            itemSchoolCategory : session.user.roleData.schoolCategory,
            officerId: session.user.roleData.accountId,
            name,
            category,
            description,
            location,
            date: selectedDate.toISOString().split("T")[0], // Only the date part
            time: dayjs(selectedDate).format('hh:mm A'), // Only the time part
            finder: finderId,
            owner: ownerId, 
            image,
            status,
            dateApproved: status === "Validating" ? new Date() : null,
            dateSurrendered: status === "Published" ? new Date() : null,
            dateMissing: status === "Missing" ? new Date() : null,
        };

        try {
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
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to save item.'}`);
            }
        } catch (error) {
            console.error('Error occurred during submission:', error);
            alert('An error occurred while saving the item. Please try again.');
        } finally {
            setLoading(false); // Ensure loading state is reset regardless of outcome
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
                                    <Input disabled={loading} autoFocus required value={name} onChange={(e) => setName(e.target.value)} />
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
                                        <FormControlLabel disabled={loading} value="Electronics" control={<Radio />} label="Electronics" />
                                        <FormControlLabel disabled={loading} value="Clothing" control={<Radio />} label="Clothing" />
                                        <FormControlLabel disabled={loading} value="Accessories" control={<Radio />} label="Accessories" />
                                    </RadioGroup>
                                </FormControl>

                                <FormControl fullWidth>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea disabled={loading} minRows={4} required value={description} onChange={(e) => setDescription(e.target.value)} />
                                </FormControl>

                                <FormControl fullWidth>
                                    <FormLabel>Found Location</FormLabel>
                                    <Input disabled={loading} required value={location} onChange={(e) => setLocation(e.target.value)} />
                                </FormControl>

                                <FormControl fullWidth>
                                    <FormLabel>Date and Time</FormLabel>
                                    <Input
                                        disabled={loading}
                                        fullWidth
                                        required
                                        type="datetime-local"
                                        value={dateTime}
                                        onChange={(e) => setDateTime(e.target.value)}
                                        slotProps={{
                                            input: {
                                                min: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Set min to 30 days in the past
                                                max: new Date().toISOString().slice(0, 16), // Set max to the current date and time
                                            }
                                        }}
                                    />
                                </FormControl>

                                <FormControl fullWidth>
                                    <FormLabel>{isFoundItem ? "Finder" : "Owner"}</FormLabel>
                                    <Autocomplete
                                        disabled={loading}
                                        placeholder="Select a user"
                                        options={users || []}
                                        getOptionLabel={(user) => `${user.accountId} - ${user.firstname} ${user.lastname}`}
                                        value={isFoundItem ? finder : owner}
                                        isOptionEqualToValue={(option, value) => option?.accountId === value?.accountId}
                                        onChange={(event, value) => {
                                            isFoundItem ?  setFinder(value) : setOwner(value);
                                        }}
                                    />
                                </FormControl>

                                <FormControl fullWidth>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <FormLabel>Upload Image</FormLabel>
                                        {image && <Button disabled={loading} size="sm" color="danger" onClick={() => setImage(null)}>Discard</Button>}
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

                                {isFoundItem && <FormControl fullWidth>
                                    <Checkbox
                                        disabled={loading}
                                        label="Is the item already surrendered?"
                                        variant="soft"
                                        checked={itemSurrendered}
                                        onChange={(e) => setItemSurrendered(e.target.checked)}
                                    />
                                </FormControl>}

                                <Button loading={loading} type="submit" fullWidth>Submit</Button>
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
