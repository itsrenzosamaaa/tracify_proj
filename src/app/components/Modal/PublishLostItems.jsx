'use client'

import { DialogContent, Modal, ModalDialog, Stack, Typography, ModalClose, FormControl, FormLabel, Input, Autocomplete, Button, Box, Checkbox, Textarea } from '@mui/joy'
import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { subDays, isBefore, isAfter } from 'date-fns';

const PublishLostItem = ({ open, onClose, fetchItems }) => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [lostDate, setLostDate] = useState('');
    const [image, setImage] = useState(null);
    const [owner, setOwner] = useState(null);
    const {data: session, status} = useSession();

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

        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);
        const selectedDate = new Date(lostDate);
    
        if (isBefore(selectedDate, thirtyDaysAgo)) {
            alert('The found date should be within the last 30 days.');
            return;
        }
    
        if (isAfter(selectedDate, now)) {
            alert('The found date cannot be in the future.');
            return;
        }

        const lostItemData = {
            owner: owner?._id,
            name,
            description,
            location,
            date: selectedDate.toISOString().split("T")[0],
            time: selectedDate.toTimeString().split(" ")[0].slice(0, 5),
            image,
            status: 'Missing',
            dateMissing: new Date(),
        };

        console.log(lostItemData)

        try{
            const response = await fetch('/api/lost-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lostItemData),
            });
            if (response.ok) {
                alert('success')
                onClose();
                setName('');
                setDescription('');
                setLocation(null);
                setLostDate('');
                setImage(null);
                setOwner(null);
                fetchItems();
            } else {
                const data = await response.json();
                alert(`Failed to add lost item: ${data.error}`);
            }
        } catch (error) {
            console.error('Error adding lost item:', error);
            alert('An error occurred while adding the lost item.');
        }
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
    return (
        <>
            <Modal open={open} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" sx={{ mb: 2 }}>Publish a Lost Item</Typography>
                    <DialogContent sx={{ overflowX: 'hidden' }}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <FormControl>
                                    <FormLabel>Name</FormLabel>
                                    <Input required type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea required type="text" name="description" minRows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                                </FormControl>
                                <FormControl>
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
                                <FormControl>
                                    <FormLabel>Lost Date and Time</FormLabel>
                                    <Input
                                        required
                                        type="datetime-local" // Ensures the input is a date-time picker
                                        name="lostDate"
                                        value={lostDate} // This will be the state holding the date-time value
                                        onChange={(e) => setLostDate(e.target.value)} // Update state with the selected date-time
                                    />
                                </FormControl>
                                <FormControl>
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
                                <Button type="submit">Publish</Button>
                            </Stack>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>
        </>
    )
}

export default PublishLostItem