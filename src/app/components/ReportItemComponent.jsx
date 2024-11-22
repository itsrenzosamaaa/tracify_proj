import React, { useState, useEffect } from 'react';
import { Select, Option, Checkbox, Autocomplete, Grid, Stepper, Stack, Step, Typography, Button, StepIndicator, Box, FormControl, FormLabel, Input, Textarea, FormHelperText, Modal, ModalDialog } from '@mui/joy';
import { Paper, Fade } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { subDays, isBefore, isAfter, format } from 'date-fns';

const ReportItemComponent = ({ isFoundItem, session }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [images, setImages] = useState([]);
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [color, setColor] = useState();
    const [size, setSize] = useState();
    const [category, setCategory] = useState();
    const [material, setMaterial] = useState();
    const [condition, setCondition] = useState();
    const [distinctiveMarks, setDistinctiveMarks] = useState();
    const [itemWhereabouts, setItemWhereabouts] = useState(false);
    const [itemLocation, setItemLocation] = useState(!isFoundItem ? 'Unidentified' : '');
    const [foundDate, setFoundDate] = useState('');
    const [lostDateStart, setLostDateStart] = useState('Unidentified');
    const [lostDateEnd, setLostDateEnd] = useState('Unidentified');
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const router = useRouter();

    const handleCheck = (e) => {
        const check = e.target.checked;
        setItemWhereabouts(check)

        if (check) {
            setItemLocation('');
            setLostDateStart('');
            setLostDateEnd('');
        } else {
            setItemLocation('Unidentified');
            setLostDateStart('Unidentified');
            setLostDateEnd('Unidentified');
        }
    }

    // Steps data
    const steps = [
        { label: 'Item Information', description: 'Provide essential details about the item.' },
        { label: 'Upload Image', description: 'Attach an image to help identify the item.' },
        { label: 'Review & Confirm', description: 'Verify all details before submission.' },
    ];

    const locationOptions = ["RLO Building", "FJN Building", "MMN Building", 'Canteen', 'TLC Court'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = {
            isFoundItem,
            name: itemName,
            description: itemDescription,
            color,
            size,
            category,
            material,
            condition,
            distinctiveMarks,
            location: itemLocation,
            date_time: isFoundItem ? format(new Date(foundDate), 'MMMM dd,yyyy hh:mm a') : itemWhereabouts ? `${format(new Date(lostDateStart), 'MMMM dd, yyyy hh:mm a')} to ${format(new Date(lostDateEnd), 'MMMM dd, yyyy hh:mm a')}` : 'Unidentified',
            images,
            status: "Request",
            dateRequest: new Date(),
        };

        try {
            const apiEndpoint = isFoundItem ? '/api/found-items' : '/api/lost-items';

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add item');
            }

            const unknownData = {
                user: session?.user?.id,
                item: data._id,
            };

            // Set up variable to hold the response for later validation
            let secondResponse;

            if (data.isFoundItem) {
                secondResponse = await fetch('/api/finder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(unknownData),
                });
            } else {
                secondResponse = await fetch('/api/owner', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(unknownData),
                });
            }

            const secondData = await secondResponse.json();

            if (!secondResponse.ok) {
                throw new Error(secondData.error || 'Failed to add owner/finder');
            }

            // Success
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
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

    // Validate the inputs for the current step
    const isNextDisabled = () => {
        const now = new Date();

        if (activeStep === 0) {
            // Shared validation for item details
            if (
                itemName.length <= 3 ||
                itemDescription.length > 100 ||
                !itemName ||
                !itemDescription ||
                !color ||
                !size ||
                !category ||
                !material ||
                !condition ||
                !distinctiveMarks
            ) {
                return true;
            }

            // Additional validation when the checkbox is checked
            if (itemWhereabouts) {
                if (!itemLocation) {
                    return true;
                }

                const startDate = new Date(lostDateStart);
                const endDate = new Date(lostDateEnd);

                if (!lostDateStart || !lostDateEnd || isAfter(startDate, now) || isBefore(endDate, startDate)) {
                    return true;
                }
            }

            if (isFoundItem) {
                if (!location || !foundDate) {
                    return true;
                }

                const selectedDate = new Date(foundDate);
                const thirtyDaysAgo = subDays(now, 30);

                if (!foundDate || isAfter(selectedDate, now) || isBefore(selectedDate, thirtyDaysAgo)) {
                    return true;
                }
            }
        }

        if (activeStep === 1) {
            // Validation for the second step (image upload)
            return !images;
        }

        return false; // Allow progression if all validations pass
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
                                        <Typography level="body-xs" sx={{ display: { xs: 'none', lg: 'block' } }}>{activeStep === index ? step.description : activeStep > index ? "Done" : "Pending"}</Typography>
                                    </Box>
                                </Step>
                            ))}
                        </Stepper>

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ marginTop: '20px' }}>
                                {activeStep === 0 &&
                                    <Fade in={activeStep === 0} timeout={500}>
                                        <Box>
                                            <Typography level="h4" mb={3}>
                                                Please provide item details.
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <FormControl fullWidth>
                                                        <FormLabel>Name of the item you {isFoundItem ? 'found' : 'lost'}</FormLabel>
                                                        <Input
                                                            placeholder="Name of your item..."
                                                            value={itemName}
                                                            onChange={(e) => setItemName(e.target.value)}
                                                            required
                                                        />
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <FormControl fullWidth>
                                                        <FormLabel>Describe the item you {isFoundItem ? 'found' : 'lost'}</FormLabel>
                                                        <Textarea
                                                            placeholder="Describe your item..."
                                                            value={itemDescription}
                                                            onChange={(e) => setItemDescription(e.target.value)}
                                                            minRows={2}
                                                            required
                                                            endDecorator={
                                                                <Typography
                                                                    level="body-xs"
                                                                    sx={{ ml: 'auto' }}
                                                                    color={itemDescription.length > 80 ? 'danger' : 'neutral'}
                                                                >
                                                                    {itemDescription.length} character(s)
                                                                </Typography>
                                                            }
                                                        />
                                                        <FormHelperText>
                                                            Please use your words properly to optimize matching items.
                                                        </FormHelperText>
                                                    </FormControl>
                                                </Grid>

                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                                                    {[
                                                        { label: 'Color', value: color, onChange: setColor, options: ['Black', 'White', 'Blue', 'Red', 'Brown'] },
                                                        { label: 'Size', value: size, onChange: setSize, options: ['Small', 'Medium', 'Large'] },
                                                        { label: 'Category', value: category, onChange: setCategory, options: ['Electronics', 'Clothing', 'Accessories'] },
                                                        { label: 'Material', value: material, onChange: setMaterial, options: ['Leather', 'Metal', 'Plastic', 'Fabric'] },
                                                        { label: 'Condition', value: condition, onChange: setCondition, options: ['New', 'Damaged', 'Old'] },
                                                        { label: 'Distinctive Marks', value: distinctiveMarks, onChange: setDistinctiveMarks, options: ['None', 'Scratches', 'Stickers', 'Initials', 'Keychain'] },
                                                    ].map((field, index) => (
                                                        <Box sx={{ flexBasis: { xs: '100%', sm: '30%' } }} key={index}>
                                                            <FormControl fullWidth>
                                                                <FormLabel>{field.label}</FormLabel>
                                                                <Select
                                                                    placeholder={`Select ${field.label}`}
                                                                    value={field.value}
                                                                    onChange={(e, value) => field.onChange(value)}
                                                                    required
                                                                >
                                                                    <Option value="" disabled>
                                                                        Select {field.label}
                                                                    </Option>
                                                                    {field.options.map((option) => (
                                                                        <Option key={option} value={option}>
                                                                            {option}
                                                                        </Option>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Box>
                                                    ))}
                                                </Box>

                                                {/* Conditional Lost/Found Fields */}
                                                <Grid item xs={12}>
                                                    {!isFoundItem ? (
                                                        <>
                                                            <FormControl>
                                                                <Checkbox
                                                                    label="The owner knows the item's whereabouts"
                                                                    checked={itemWhereabouts}
                                                                    onChange={handleCheck}
                                                                />
                                                            </FormControl>
                                                            {itemWhereabouts && (
                                                                <>
                                                                    <FormControl fullWidth>
                                                                        <FormLabel>Location where you lost the item</FormLabel>
                                                                        <Autocomplete
                                                                            placeholder="Select a location"
                                                                            options={locationOptions}
                                                                            value={itemLocation}
                                                                            onChange={(event, value) => setItemLocation(value)}
                                                                            getOptionLabel={(option) => option}
                                                                        />
                                                                    </FormControl>

                                                                    <Grid container spacing={2} mt={2}>
                                                                        <Grid item xs={12} sm={6}>
                                                                            <FormControl required fullWidth>
                                                                                <FormLabel>Start Date and Time</FormLabel>
                                                                                <Input
                                                                                    type="datetime-local"
                                                                                    name="lostDateStart"
                                                                                    value={lostDateStart}
                                                                                    onChange={handleStartDateChange}
                                                                                />
                                                                            </FormControl>
                                                                        </Grid>
                                                                        <Grid item xs={12} sm={6}>
                                                                            <FormControl required fullWidth>
                                                                                <FormLabel>End Date and Time</FormLabel>
                                                                                <Input
                                                                                    type="datetime-local"
                                                                                    name="lostDateEnd"
                                                                                    value={lostDateEnd}
                                                                                    onChange={handleEndDateChange}
                                                                                />
                                                                            </FormControl>
                                                                        </Grid>
                                                                    </Grid>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FormControl fullWidth>
                                                                <FormLabel>Location where you found the item</FormLabel>
                                                                <Autocomplete
                                                                    placeholder="Select a location"
                                                                    options={locationOptions}
                                                                    value={itemLocation}
                                                                    onChange={(event, value) => setItemLocation(value)}
                                                                    getOptionLabel={(option) => option}
                                                                />
                                                            </FormControl>
                                                            <FormControl required>
                                                                <FormLabel>Found Date</FormLabel>
                                                                <Input
                                                                    type="datetime-local"
                                                                    name="foundDate"
                                                                    value={foundDate}
                                                                    onChange={(e) => setFoundDate(e.target.value)}
                                                                />
                                                            </FormControl>
                                                        </>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Fade>
                                }
                                {activeStep === 1 &&
                                    <Fade in={activeStep === 1} timeout={500}>
                                        <Box>
                                            <Typography level="h4">Please upload an image of your item.</Typography>
                                            <Stack spacing={2} sx={{ my: 5 }}>
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
                                            </Stack>
                                        </Box>
                                    </Fade>
                                }
                                {activeStep === 2 &&
                                    <Fade in={activeStep === 2} timeout={500}>
                                        <Box sx={{ padding: 3, borderRadius: 2, backgroundColor: '#f9f9f9', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                                            <Typography level="h4" fontWeight="bold" textAlign="center" mb={4}>
                                                Please Confirm the Details Below
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} lg={6}>
                                                    <Stack spacing={2}>
                                                        {[
                                                            { label: 'Item Name', value: itemName },
                                                            { label: 'Color', value: color },
                                                            { label: 'Size', value: size },
                                                            { label: 'Category', value: category },
                                                        ].map((item, index) => (
                                                            <Box key={index} sx={{ backgroundColor: '#fff', borderRadius: 2, padding: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                                                <Typography sx={{ fontWeight: 'bold', color: '#555', marginBottom: 1 }}>{item.label}</Typography>
                                                                <Typography sx={{ color: '#333', fontWeight: 500 }}>{item.value || 'N/A'}</Typography>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} lg={6}>
                                                    <Stack spacing={2}>
                                                        {[
                                                            { label: 'Material', value: material },
                                                            { label: 'Condition', value: condition },
                                                            { label: 'Distinctive Marks', value: distinctiveMarks },
                                                            { label: 'Item Location', value: itemLocation },
                                                        ].map((item, index) => (
                                                            <Box key={index} sx={{ backgroundColor: '#fff', borderRadius: 10, padding: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                                                <Typography sx={{ fontWeight: 'bold', color: '#555', marginBottom: 1 }}>{item.label}</Typography>
                                                                <Typography sx={{ color: '#333', fontWeight: 500 }}>{item.value || 'N/A'}</Typography>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                </Grid>
                                                {!isFoundItem ? (
                                                    <>
                                                        <Grid item xs={12} lg={6}>
                                                            <Box sx={{ backgroundColor: '#fff', borderRadius: 2, padding: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                                                <Typography sx={{ fontWeight: 'bold', color: '#555', marginBottom: 1 }}>Lost Start Date</Typography>
                                                                <Typography sx={{ color: '#333', fontWeight: 500 }}>
                                                                    {lostDateStart === 'Unidentified' ? lostDateStart : dayjs(lostDateStart).format('MMMM D, YYYY - hh:mm a')}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} lg={6}>
                                                            <Box sx={{ backgroundColor: '#fff', borderRadius: 2, padding: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                                                <Typography sx={{ fontWeight: 'bold', color: '#555', marginBottom: 1 }}>Lost End Date</Typography>
                                                                <Typography sx={{ color: '#333', fontWeight: 500 }}>
                                                                    {lostDateEnd === 'Unidentified' ? lostDateEnd : dayjs(lostDateEnd).format('MMMM D, YYYY - hh:mm a')}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Grid item xs={12} lg={6}>
                                                            <Box sx={{ backgroundColor: '#fff', borderRadius: 2, padding: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                                                <Typography sx={{ fontWeight: 'bold', color: '#555', marginBottom: 1 }}>Found Date</Typography>
                                                                <Typography sx={{ color: '#333', fontWeight: 500 }}>
                                                                    {dayjs(foundDate).format('MMMM D, YYYY')}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>

                                                        <Grid item xs={12} lg={6}>
                                                            <Box sx={{ backgroundColor: '#fff', borderRadius: 2, padding: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                                                <Typography sx={{ fontWeight: 'bold', color: '#555', marginBottom: 1 }}>Found Time</Typography>
                                                                <Typography sx={{ color: '#333', fontWeight: 500 }}>
                                                                    {dayjs(foundDate).format('hh:mm A')}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </>
                                                )}
                                                <Grid item xs={12}>
                                                    <Stack spacing={2}>
                                                        <Box sx={{ backgroundColor: '#fff', borderRadius: 10, padding: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                                            <Typography sx={{ fontWeight: 'bold', color: '#555', marginBottom: 1 }}>Item Description</Typography>
                                                            <Typography sx={{ color: '#333', fontWeight: 500 }}>{itemDescription || 'N/A'}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <Typography sx={{ fontWeight: 'bold', color: '#555', marginBottom: 2 }}>
                                                            Item Image
                                                        </Typography>
                                                        {images.length > 0 ? (
                                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                                                                {images.map((image, index) => (
                                                                    <Box key={index} sx={{ position: 'relative' }}>
                                                                        <Image
                                                                            src={image}
                                                                            alt={`Item Preview ${index + 1}`}
                                                                            width={150}
                                                                            height={150}
                                                                            style={{
                                                                                width: '100%',
                                                                                height: 'auto',
                                                                                objectFit: 'cover',
                                                                                borderRadius: '10px',
                                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        ) : (
                                                            <Typography sx={{ color: 'text.secondary' }}>No images uploaded.</Typography>
                                                        )}
                                                    </Box>
                                                </Grid>

                                            </Grid>
                                        </Box>
                                    </Fade>
                                }
                            </Box>

                            <Stack direction="row" justifyContent="space-between" sx={{ marginTop: '20px' }}>
                                <Button loading={loading} disabled={activeStep === 0} onClick={handleBack}>
                                    Back
                                </Button>
                                <Button loading={loading} disabled={isNextDisabled()} onClick={activeStep === 2 ? handleSubmit : handleNext}>
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