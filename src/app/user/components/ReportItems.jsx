import React, { useState, useEffect } from 'react';
import { Grid, Stepper, Stack, Step, Typography, Button, StepIndicator, Box, FormControl, FormLabel, Input, Textarea, FormHelperText, Modal, ModalDialog } from '@mui/joy';
import { Paper, FormControlLabel, RadioGroup, Radio, Fade } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const ReportItemComponent = ({ isFoundItem, session }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [image, setImage] = useState(null);
    const [itemName, setItemName] = useState('');
    const [itemCategory, setItemCategory] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemLocation, setItemLocation] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const router = useRouter();

    // Steps data
    const steps = [
        { label: 'Item Details', description: 'Enter your Item Details' },
        { label: 'Shipping Address', description: 'Provide the shipping address' },
        { label: 'Shipping Method', description: 'Select a shipping method' },
        { label: 'Confirmation', description: 'Please confirm the details.' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = {
            isFoundItem,
            itemSchoolCategory: session.user.roleData.schoolCategory,
            name: itemName,
            category: itemCategory,
            description: itemDescription,
            location: itemLocation,
            date: new Date(dateTime).toISOString().split("T")[0],
            time: dayjs(dateTime).format('hh:mm A'),
            finder: isFoundItem ? session.user.roleData.accountId : null,
            owner: !isFoundItem ? session.user.roleData.accountId : null,
            image,
            status: "Request",
            dateReported: new Date(),
        };

        try {
            const response = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Item saved successfully:", result);
                setShowSuccessModal(true);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to save item.'}`);
                setLoading(false)
            }
        } catch (error) {
            console.error('Error occurred during submission:', error);
            alert('An error occurred while saving the item. Please try again.');
        } finally {
            setLoading(false); // Ensure loading state is reset regardless of outcome
        }
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

    // Validate the inputs for the current step
    const isNextDisabled = () => {
        if (activeStep === 0) {
            if (itemName.length <= 5 || itemDescription.length > 80) {
                return true;
            }
            return !itemName || !itemCategory || !itemDescription;
        }
        if (activeStep === 1) {
            const currentDateTime = new Date();
            const selectedDateTime = new Date(dateTime);

            const timeDifference = currentDateTime.getTime() - selectedDateTime.getTime();
            const daysDifference = timeDifference / (1000 * 3600 * 24); // Difference in days

            if (daysDifference > 30 || selectedDateTime > currentDateTime) {
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
                router.push('/user/dashboard');
            }

            // Clear interval when modal closes or component unmounts
            return () => clearInterval(timer);
        }
    }, [showSuccessModal, countdown, router]);

    return (
        <>
            <Box
                sx={{
                    marginTop: "60px", // Ensure space for header
                    marginLeft: { xs: "0px", lg: "250px" }, // Shift content when sidebar is visible on large screens
                    padding: "20px",
                    transition: "margin-left 0.3s ease",
                }}
            >
                <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={2} sx={{ padding: '1rem', marginBottom: '20px', maxWidth: '100%' }}>
                            <Stepper activeStep={activeStep} orientation="horizontal">
                                {steps.map((step, index) => (
                                    <Step key={index} indicator={<StepIndicator variant="solid" color={activeStep === index ? 'primary' : 'neutral'}>{index + 1}</StepIndicator>}>
                                        <Box>
                                            <Typography level="title-sm" sx={{ display: { xs: 'none', lg: 'block' } }}>{step.label}</Typography>
                                            <Typography level="body-xs" sx={{ display: { xs: 'none', lg: 'block' } }}>{activeStep === index ? step.description : 'Pending'}</Typography>
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
                                                        <FormLabel>Item Name</FormLabel>
                                                        <Input placeholder='Name of your item...' value={itemName} onChange={(e) => setItemName(e.target.value)} required />
                                                    </FormControl>
                                                    <FormControl fullWidth>
                                                        <FormLabel>Item Category</FormLabel>
                                                        <RadioGroup
                                                            row
                                                            name="category"
                                                            value={itemCategory}
                                                            onChange={(e) => setItemCategory(e.target.value)}
                                                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                                        >
                                                            <FormControlLabel value="Electronics" control={<Radio />} label="Electronics" />
                                                            <FormControlLabel value="Clothing" control={<Radio />} label="Clothing" />
                                                            <FormControlLabel value="Accessories" control={<Radio />} label="Accessories" />
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormControl fullWidth>
                                                        <FormLabel>Item Description</FormLabel>
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
                                                        <FormLabel>Found Location</FormLabel>
                                                        <Input placeholder='Where did you found the item?' value={itemLocation} onChange={(e) => setItemLocation(e.target.value)} required />
                                                    </FormControl>

                                                    <FormControl fullWidth>
                                                        <FormLabel>Found Date and Time</FormLabel>
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
                                                                style={{ width: '100%', height: 'auto', objectFit: 'cover', marginBottom: '1rem' }}
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
                                            <Box sx={{ padding: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                                                <Typography level="h4" fontWeight="bold" mb={2}>Kindly confirm these details below.</Typography>
                                                <Stack spacing={2} sx={{ my: 5 }}>

                                                    {/* First Row: Item Name and Item Category */}
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} lg={6}>
                                                            <FormControl fullWidth sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#fff' }}>
                                                                <FormLabel sx={{ fontWeight: 'bold', color: '#555' }}>Item Name</FormLabel>
                                                                <Typography level="body1" sx={{ color: '#333', fontWeight: '500' }}>{itemName}</Typography>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={12} lg={6}>
                                                            <FormControl fullWidth sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#fff' }}>
                                                                <FormLabel sx={{ fontWeight: 'bold', color: '#555' }}>Item Category</FormLabel>
                                                                <Typography level="body1" sx={{ color: '#333', fontWeight: '500' }}>{itemCategory}</Typography>
                                                            </FormControl>
                                                        </Grid>
                                                    </Grid>

                                                    {/* Second Row: Item Description */}
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <FormControl fullWidth sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#fff' }}>
                                                                <FormLabel sx={{ fontWeight: 'bold', color: '#555' }}>Item Description</FormLabel>
                                                                <Typography level="body1" sx={{ color: '#333', fontWeight: '500' }}>{itemDescription}</Typography>
                                                            </FormControl>
                                                        </Grid>
                                                    </Grid>

                                                    {/* Third Row: Item Location and Item Records */}
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} lg={6}>
                                                            <FormControl fullWidth sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#fff' }}>
                                                                <FormLabel sx={{ fontWeight: 'bold', color: '#555' }}>Item Location</FormLabel>
                                                                <Typography level="body1" sx={{ color: '#333', fontWeight: '500' }}>{itemLocation}</Typography>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={12} lg={6}>
                                                            <FormControl fullWidth sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#fff' }}>
                                                                <FormLabel sx={{ fontWeight: 'bold', color: '#555' }}>Item Records</FormLabel>
                                                                <Typography level="body1" sx={{ color: '#333', fontWeight: '500' }}>
                                                                    {dayjs(dateTime).format('MMMM D, YYYY h:mm A')}
                                                                </Typography>
                                                            </FormControl>
                                                        </Grid>
                                                    </Grid>

                                                    {/* Fourth Row: Item Image */}
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <FormControl fullWidth sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#fff' }}>
                                                                <FormLabel sx={{ fontWeight: 'bold', color: '#555', marginBottom: '1rem' }}>Item Image</FormLabel>
                                                                <Image
                                                                    src={image}
                                                                    width={0}
                                                                    height={0}
                                                                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                                    style={{
                                                                        width: '100%',
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
                                    <Button onClick={() => router.push('/user/dashboard')} sx={{ mt: 2 }}>
                                        Redirect now
                                    </Button>
                                </ModalDialog>
                            </Modal>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default ReportItemComponent;
