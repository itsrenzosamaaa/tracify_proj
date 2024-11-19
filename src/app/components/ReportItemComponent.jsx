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
    const [image, setImage] = useState(null);
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
            image,
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
            return !image;
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
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Box sx={{ width: '100%' }}>
                                                        <FormControl>
                                                            <FormLabel>Color</FormLabel>
                                                            <Select
                                                                placeholder="Select Color"
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
                                                                placeholder="Select Size"
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
                                                                placeholder="Select Category"
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
                                                                placeholder="Select Material"
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
                                                                placeholder="Select Condition"
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
                                                                placeholder="Select Distinctive Marks"
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
                                                {
                                                    !isFoundItem
                                                        ? (
                                                            <>
                                                                <FormControl>
                                                                    <Checkbox
                                                                        label="The owner knows the item's whereabouts"
                                                                        checked={itemWhereabouts}
                                                                        onChange={handleCheck}
                                                                    />
                                                                </FormControl>
                                                                {
                                                                    itemWhereabouts &&
                                                                    <>
                                                                        <FormControl fullWidth>
                                                                            <FormLabel>Location where you lost the item</FormLabel>
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

                                                                        <Box display="flex" gap={2}>
                                                                            {/* Start Date and Time */}
                                                                            <Box sx={{ width: '100%' }}>
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
                                                                            </Box>

                                                                            {/* End Date and Time */}
                                                                            <Box sx={{ width: '100%' }}>
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
                                                                        </Box>
                                                                    </>
                                                                }
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FormControl fullWidth>
                                                                    <FormLabel>Location where you found the item</FormLabel>
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
                                                                <FormControl required>
                                                                    <FormLabel>Found Date</FormLabel>
                                                                    <Input
                                                                        fullWidth
                                                                        required
                                                                        type="datetime-local" // Ensures the input is a date-time picker
                                                                        name="foundDate"
                                                                        value={foundDate} // State holding the start date-time value
                                                                        onChange={(e) => setFoundDate(e.target.value)} // Update state with the selected date-time
                                                                    />
                                                                </FormControl>
                                                            </>
                                                        )
                                                }
                                            </Stack>
                                        </Box>
                                    </Fade>
                                }
                                {activeStep === 1 &&
                                    <Fade in={activeStep === 1} timeout={500}>
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
                                                            <p>{image ? "Image Selected" : "Drag 'n' drop some image here, or click to select image"}</p>
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
                                                        <Typography sx={{ fontWeight: 'bold', color: '#555', marginBottom: 2 }}>Item Image</Typography>
                                                        <Image
                                                            src={image}
                                                            alt="Item Preview"
                                                            width={0}
                                                            height={0}
                                                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            style={{
                                                                width: '100%',
                                                                maxWidth: '350px',
                                                                height: 'auto',
                                                                objectFit: 'cover',
                                                                borderRadius: '10px',
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                            }}
                                                        />
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