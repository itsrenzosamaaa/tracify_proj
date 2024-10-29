import React, { useState, useEffect } from 'react';
import { Autocomplete, Grid, Stepper, Stack, Step, Typography, Button, StepIndicator, Box, FormControl, FormLabel, Input, Textarea, FormHelperText, Modal, ModalDialog } from '@mui/joy';
import { Paper, Fade } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { subDays, isBefore, isAfter } from 'date-fns';

const ReportItemComponent = ({ isFoundItem, session }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [image, setImage] = useState(null);
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemLocation, setItemLocation] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const router = useRouter(); 

    // Steps data
    const steps = [
        { label: 'Item Information', description: 'Provide essential details about the item.' },
        { label: 'Location Details', description: 'Specify the last known location of the item.' },
        { label: 'Upload Images', description: 'Attach images to help identify the item.' },
        { label: 'Review & Confirm', description: 'Verify all details before submission.' },
    ];

    const locationOptions = ["RLO Building", "FJN Building", "MMN Building", 'Canteen', 'TLC Court'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        const formData = {
            name: itemName,
            description: itemDescription,
            location: itemLocation,
            date: new Date(dateTime).toISOString().split("T")[0],
            time: new Date(dateTime).toTimeString().split(" ")[0].slice(0, 5),
            image,
            status: "Request",
            dateRequest: new Date(),
        };
    
        if (isFoundItem) {
            formData.finder = session?.user?.id;
    
            try {
                const response = await fetch('/api/found-items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
    
                if (response.ok) {
                    setShowSuccessModal(true);
                } else {
                    const data = await response.json();
                    alert(`Failed to add found item: ${data.error}`);
                }
            } catch (error) {
                console.error('Error adding found item:', error);
                alert('An error occurred while adding the found item.');
            }
        } else {
            formData.owner = session?.user?.id;
    
            try {
                const response = await fetch('/api/lost-items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
    
                if (response.ok) {
                    setShowSuccessModal(true);
                } else {
                    const data = await response.json();
                    alert(`Failed to add lost item: ${data.error}`);
                }
            } catch (error) {
                console.error('Error adding lost item:', error);
                alert('An error occurred while adding the lost item.');
            }
        }
    
        // Reset loading after operation
        setLoading(false);
    };    

    // Handler to go to the next step
    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    // Handler to go to the previous step
    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep((prevActiveStep) => prevActiveStep - 1);
        }
    };

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0]; // Get the first selected file
        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
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

    // Validate the inputs for the current step
    const isNextDisabled = () => {
        if (activeStep === 0) {
            if (itemName.length <= 5 || itemDescription.length > 80) {
                return true;
            }
            return !itemName || !itemDescription;
        }
        if (activeStep === 1) {
            const now = new Date();
            const thirtyDaysAgo = subDays(now, 30);
            const selectedDate = new Date(dateTime);

            if (isBefore(selectedDate, thirtyDaysAgo) || isAfter(selectedDate, now)) {
                return true;
            }
            return !itemLocation || !dateTime;
        }
        if (activeStep === 2) {
            return !image;
        }
        return false;
    };

    useEffect(() => {
        if (showSuccessModal) {
            const timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);

            // Redirect when countdown reaches 0
            if (countdown === 0) {
                router.push('/my-items');
            }

            // Clear interval when modal closes or component unmounts
            return () => clearInterval(timer);
        }
    }, [showSuccessModal, countdown, router]);

    return (
        <>
            <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid item xs={12} lg={12}>
                    <Paper elevation={2} sx={{ padding: '1rem', marginBottom: '20px', maxWidth: '100%' }}>
                        <Stepper activeStep={activeStep} orientation="horizontal">
                            {steps.map((step, index) => (
                                <Step key={index} indicator={<StepIndicator variant="solid" color={activeStep === index ? 'primary' : 'neutral'}>{index + 1}</StepIndicator>}>
                                    <Box>
                                        <Typography level="title-sm" sx={{ display: { xs: 'none', lg: 'block' } }}>{step.label}</Typography>
                                        <Typography level="body-xs" sx={{ display: { xs: 'none', lg: 'block' } }}>{activeStep === index ? step.description : activeStep > index ? "Done" : "Pending" }</Typography>
                                    </Box>
                                </Step>
                            ))}
                        </Stepper>

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ marginTop: '20px' }}>
                                {activeStep === 0 &&
                                    <Fade in={activeStep === 0} timeout={500}>
                                        <Box>
                                            <Typography level="h4">Please provide an item details.</Typography>
                                            <Stack spacing={2} sx={{ my: 5 }}>
                                                <FormControl fullWidth>
                                                    <FormLabel>Name of the item you {isFoundItem ? 'found' : 'lost'}</FormLabel>
                                                    <Input placeholder='Name of your item...' value={itemName} onChange={(e) => setItemName(e.target.value)} required />
                                                </FormControl>
                                                <FormControl fullWidth>
                                                    <FormLabel>Describe the item you {isFoundItem ? 'found' : 'lost'}</FormLabel>
                                                    <Textarea placeholder='Describe your item...' value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} minRows={2} required endDecorator={
                                                        <Typography level='body-xs' sx={{ ml: "auto" }} color={itemDescription.length > 80 ? "danger" : "neutral"}>
                                                            {itemDescription.length} character(s)
                                                        </Typography>
                                                    } />
                                                    <FormHelperText>Please use your words properly to optimize in matching items.</FormHelperText>
                                                </FormControl>
                                            </Stack>
                                        </Box>
                                    </Fade>
                                }
                                {activeStep === 1 &&
                                    <Fade in={activeStep === 1} timeout={500}>
                                        <Box>
                                            <Typography level="h4">Provide whereabouts about the item.</Typography>
                                            <Stack spacing={2} sx={{ my: 5 }}>
                                                <FormControl fullWidth>
                                                    <FormLabel>Location where you {isFoundItem ? 'found' : 'lost'}</FormLabel>
                                                    <Autocomplete
                                                        placeholder="Select a location"
                                                        options={locationOptions}
                                                        value={itemLocation}
                                                        onChange={(event, value) => {
                                                            setItemLocation(value);
                                                            console.log('Selected location:', value);
                                                        }}
                                                        getOptionLabel={(option) => option}
                                                    />
                                                </FormControl>

                                                <FormControl fullWidth>
                                                    <FormLabel>Date and Time that you {isFoundItem ? 'found' : 'lost'}</FormLabel>
                                                    <Input
                                                        fullWidth
                                                        required
                                                        value={dateTime}
                                                        onChange={(e) => setDateTime(e.target.value)}
                                                        type="datetime-local"
                                                        slotProps={{
                                                            input: {
                                                                min: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Set min to 30 days in the past
                                                                max: new Date().toISOString().slice(0, 16), // Set max to the current date and time
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack>
                                        </Box>
                                    </Fade>
                                }
                                {activeStep === 2 &&
                                    <Fade in={activeStep === 2} timeout={500}>
                                        <Box>
                                            <Typography level="h4">Please upload an image of your item.</Typography>
                                            <Stack spacing={2} sx={{ my: 5 }}>
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
                                                            style={{
                                                                width: '100%',
                                                                maxWidth: '300px', // Set maximum width
                                                                height: 'auto',
                                                                objectFit: 'cover',
                                                                marginBottom: '1rem',
                                                                borderRadius: '8px', // Optional: Add rounded corners
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Optional: Add shadow for aesthetics
                                                            }}
                                                            alt="Preview"
                                                        />
                                                    )}
                                                </FormControl>
                                            </Stack>
                                        </Box>
                                    </Fade>
                                }
                                {activeStep === 3 &&
                                    <Fade in={activeStep === 3} timeout={500}>
                                        <Box>
                                            <Typography level="h4" fontWeight="bold" mb={2}>
                                                Please Confirm the Details Below
                                            </Typography>
                                            <Stack spacing={3} sx={{ my: 5 }}>

                                                <Grid container spacing={2} alignItems="flex-start">
                                                    {/* Left Side: Details */}
                                                    <Grid item xs={12} lg={6}>
                                                        <Stack spacing={3}>
                                                            {/* Item Name */}
                                                            <FormControl fullWidth sx={{ borderRadius: 1, backgroundColor: '#fff' }}>
                                                                <FormLabel sx={{ fontWeight: 'bold', color: '#555' }}>Item Name</FormLabel>
                                                                <Typography sx={{ color: '#333', fontWeight: '500' }}>{itemName}</Typography>
                                                            </FormControl>

                                                            {/* Item Description */}
                                                            <FormControl fullWidth sx={{ borderRadius: 1, backgroundColor: '#fff' }}>
                                                                <FormLabel sx={{ fontWeight: 'bold', color: '#555' }}>Item Description</FormLabel>
                                                                <Typography sx={{ color: '#333', fontWeight: '500' }}>{itemDescription}</Typography>
                                                            </FormControl>

                                                            {/* Item Location */}
                                                            <FormControl fullWidth sx={{ borderRadius: 1, backgroundColor: '#fff' }}>
                                                                <FormLabel sx={{ fontWeight: 'bold', color: '#555' }}>Item Location</FormLabel>
                                                                <Typography sx={{ color: '#333', fontWeight: '500' }}>{itemLocation}</Typography>
                                                            </FormControl>

                                                            {/* Item Records */}
                                                            <FormControl fullWidth sx={{ borderRadius: 1, backgroundColor: '#fff' }}>
                                                                <FormLabel sx={{ fontWeight: 'bold', color: '#555' }}>Item Records</FormLabel>
                                                                <Typography sx={{ color: '#333', fontWeight: '500' }}>
                                                                    {dayjs(dateTime).format('MMMM D, YYYY h:mm A')}
                                                                </Typography>
                                                            </FormControl>
                                                        </Stack>
                                                    </Grid>

                                                    {/* Right Side: Image */}
                                                    <Grid item xs={12} lg={6}>
                                                        <FormControl fullWidth sx={{ borderRadius: 1, backgroundColor: '#fff' }}>
                                                            <FormLabel sx={{ fontWeight: 'bold', color: '#555', mb: 1 }}>Item Image</FormLabel>
                                                            <Image
                                                                src={image}
                                                                width={0}
                                                                height={0}
                                                                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                                style={{
                                                                    width: '100%',
                                                                    maxWidth: '300px', // Set maximum width for the image
                                                                    height: 'auto',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '10px',
                                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                                    marginBottom: '1rem'
                                                                }}
                                                                alt="Preview"
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        </Box>
                                    </Fade>
                                }
                            </Box>

                            <Stack direction="row" justifyContent="space-between" sx={{ marginTop: '20px' }}>
                                <Button loading={loading} disabled={activeStep === 0} onClick={handleBack}>
                                    Back
                                </Button>
                                <Button loading={loading} disabled={isNextDisabled()} onClick={activeStep === 3 ? handleSubmit : handleNext}>
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </Stack>
                        </form>
                        <Modal open={showSuccessModal}>
                            <ModalDialog>
                                <Typography level="h3">Success!</Typography>
                                <Typography level="body1">
                                    Item has been reported successfully. Redirecting in {countdown} seconds...
                                </Typography>
                                <Button onClick={() => router.push('/my-items')} sx={{ mt: 2 }}>
                                    Redirect now
                                </Button>
                            </ModalDialog>
                        </Modal>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default ReportItemComponent;