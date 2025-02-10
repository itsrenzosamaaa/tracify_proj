'use client'

import { Textarea, DialogContent, Modal, ModalDialog, Stack, Typography, ModalClose, FormControl, FormLabel, Input, Autocomplete, Button, Box, Checkbox } from '@mui/joy'
import React, { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import { useSession } from 'next-auth/react';

const PublishItemIdentified = ({ open, onClose, refreshData }) => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [image, setImage] = useState(null);
    const [userFindItem, setUserFindItem] = useState(false);
    const [finder, setFinder] = useState(null);
    const [owner, setOwner] = useState(null);
    const [recentLostItems, setRecentLostItems] = useState([]);
    const [selectedLostItem, setSelectedLostItem] = useState(null);
    const { data: session, status } = useSession();

    const fetchLostItems = useCallback(async () => {
        try {
            const response = await fetch('/api/lost-items');
            const data = await response.json();
            const filteredLostItems = data.filter(item => item.owner._id === owner._id && item.status === 'Missing');
            setRecentLostItems(filteredLostItems);
        } catch (error) {
            console.error(error)
        }
    }, [owner?._id]);

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
        if (owner?._id) {
            fetchLostItems()
        }
    }, [owner?._id, fetchLostItems])

    useEffect(() => {
        if (!userFindItem) setFinder('');
    }, [userFindItem]);

    const locationOptions = ["RLO Building", "FJN Building", "MMN Building", 'Canteen', 'TLC Court'];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (finder && owner && finder === owner) {
            alert('The finder and owner should not be the same user.');
            return;
        }

        let lostItemId = null;
        let lostItemDescription = null;
        let lostItemLocation = null;
        const lostItemDate = new Date().toISOString().split("T")[0];
        const lostItemTime = new Date().toTimeString().split(" ")[0].slice(0, 5);

        const status = 'Unclaimed';
        if (selectedLostItem.name === 'None') {
            const lostItemData = {
                owner: owner?._id,
                name,
                description,
                location,
                date: lostItemDate,
                time: lostItemTime,
                image,
                status,
            };

            try {
                const response = await fetch('/api/lost-items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(lostItemData),
                });
                if (!response.ok) throw new Error("Failed to create lost item");

                const savedLostItem = await response.json();
                lostItemId = savedLostItem?._id;
                lostItemDescription = savedLostItem?.description;
                lostItemLocation = savedLostItem?.location;

                console.log("Created Lost Item ID:", lostItemId);
            } catch (error) {
                console.error("Error creating lost item:", error);
                return;
            }
        } else {
            try {
                const response = await fetch(`/api/lost-items/${selectedLostItem._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                });

                if (!response.ok) throw new Error('Failed to update status');

                const updatedItem = await response.json();
                lostItemId = updatedItem?._id;
                lostItemDescription = updatedItem?.description;
                lostItemLocation = updatedItem?.location;

                console.log("Updated Lost Item ID:", lostItemId);
            } catch (error) {
                console.error("Error updating lost item status:", error);
                return;
            }
        }

        const foundItemData = {
            finder: finder?._id || null,
            name,
            description: lostItemDescription,
            location: lostItemLocation,
            date: lostItemDate,
            time: lostItemTime,
            image,
            status: 'Reserved',
            matched: lostItemId || null,
        };

        console.log("Found Item Data:", foundItemData);

        try {
            const response = await fetch('/api/found-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(foundItemData),
            });

            if (response.ok) {
                alert('Item successfully published');
                await resetForm();
            } else {
                const data = await response.json();
                alert(`Failed to add found item: ${data.error}`);
            }
        } catch (error) {
            console.error("Error creating found item:", error);
        }
    };

    // Helper function to reset form fields and close the modal
    const resetForm = async () => {
        await onClose();
        refreshData();
        setName('');
        setDescription('');
        setLocation(null);
        setImage(null);
        setOwner(null);
        setUserFindItem(false);
        setFinder(null);
        setSelectedLostItem(null);
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
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" sx={{ mb: 2 }}>Publish an Identified Item</Typography>
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
                                <FormControl required>
                                    <FormLabel>Name</FormLabel>
                                    <Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                                </FormControl>
                                <FormControl required>
                                    <FormLabel>Description</FormLabel>
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
                                    <Checkbox label="Did the student find this item?" checked={userFindItem} onChange={(e) => setUserFindItem(e.target.checked)} />
                                </FormControl>
                                {userFindItem && (
                                    <FormControl required>
                                        <FormLabel>Who is the finder?</FormLabel>
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
                                    <FormLabel>Who is the owner?</FormLabel>
                                    <Autocomplete
                                        placeholder="Select an owner"
                                        options={users || []}
                                        value={owner}
                                        onChange={(event, value) => {
                                            setOwner(value);
                                        }}
                                        getOptionLabel={(user) => {
                                            return user ? `${user.firstname} ${user.lastname}` : 'No Options';
                                        }}
                                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    />
                                </FormControl>
                                {owner && (
                                    <FormControl>
                                        <FormLabel>Their Recent Lost Items</FormLabel>
                                        <Autocomplete
                                            placeholder="Select a lost item"
                                            options={[{ id: null, name: 'None' }, ...(recentLostItems)]} // Add "None" option
                                            value={selectedLostItem}
                                            onChange={(event, value) => {
                                                setSelectedLostItem(value);
                                            }}
                                            getOptionLabel={(lostItem) => {
                                                return lostItem ? lostItem.name : 'No Options';
                                            }}
                                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                                        />
                                    </FormControl>
                                )}
                                <Button type="submit">Publish</Button>
                            </Stack>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>
        </>
    )
}

export default PublishItemIdentified