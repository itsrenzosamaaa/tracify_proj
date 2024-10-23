'use client'

import { DialogContent, Modal, ModalDialog, Stack, Typography, ModalClose, FormControl, FormLabel, Input, Autocomplete, Button, Box, Checkbox } from '@mui/joy'
import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { FindInPageRounded } from '@mui/icons-material';

const PublishFoundItem = ({ open, onClose }) => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [foundDate, setFoundDate] = useState('');
    const [image, setImage] = useState(null);
    const [studentFindItem, setStudentFindItem] = useState(false);
    const [itemIdentifiable, setItemIdentifiable] = useState(false);
    const [finder, setFinder] = useState('');
    const [owner, setOwner] = useState('');
    const { data: session, status } = useSession();

    console.log(session)

    // useEffect(() => {
    //     const fetchUsers = async () => {
    //         try {
    //             const response = await fetch('/api/user');
    //             const data = await response.json();
    //             const filteredUsers = data.filter(user => )
    //         } catch (error) {

    //         }
    //     }
    // }, [])

    const locationOptions = ["RLO Building", "FJN Building", "MMN Building", 'Canteen', 'TLC Court'];

    const handleSubmit = (e) => {
        e.preventDefault;
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
                    <Typography level="h4" sx={{ mb: 2 }}>Publish a Found Item</Typography>
                    <DialogContent sx={{ overflowX: 'hidden' }}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <FormControl>
                                    <FormLabel>Name</FormLabel>
                                    <Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Description</FormLabel>
                                    <Input type="text" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Found Location</FormLabel>
                                    <Autocomplete
                                        placeholder="Select a location"
                                        options={locationOptions}
                                        value={location}
                                        onChange={(event, value) => {
                                            setLocation(value); // Update state with selected user
                                            console.log('Selected location:', value); // Debugging
                                        }}
                                        getOptionLabel={(option) => option}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Found Date and Time</FormLabel>
                                    <Input
                                        type="datetime-local" // Ensures the input is a date-time picker
                                        name="foundDate"
                                        value={foundDate} // This will be the state holding the date-time value
                                        onChange={(e) => setFoundDate(e.target.value)} // Update state with the selected date-time
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
                                    <Checkbox label="Did the student find this item?" checked={studentFindItem} onChange={(e) => setStudentFindItem(e.target.checked)} />
                                </FormControl>
                                <FormControl>
                                    <Checkbox label="Is the item identifiable to owner?" checked={itemIdentifiable} onChange={(e) => setItemIdentifiable(e.target.checked)} />
                                </FormControl>
                                {studentFindItem &&
                                    <FormControl>
                                        <FormLabel>Who is the finder?</FormLabel>
                                        <Autocomplete
                                            placeholder="Select a finder"
                                            options={users || []}  // Ensure users is an array
                                            value={finder}  // Ensure value corresponds to an option in users
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
                                {itemIdentifiable &&
                                    <FormControl>
                                        <FormLabel>Who is the owner?</FormLabel>
                                        <Autocomplete
                                            placeholder="Select an owner"
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
                                <Button type="submit">Publish</Button>
                            </Stack>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>
        </>
    )
}

export default PublishFoundItem