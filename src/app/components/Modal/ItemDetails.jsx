'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Avatar,
    Grid,
    Stepper,
    Step,
    Divider,
    Button,
    Input,
    Select,
    Option,
    Textarea,
    Autocomplete,
    Snackbar,
    Checkbox,
    Chip,
} from '@mui/joy';
import { CldImage } from 'next-cloudinary';
import { format, subDays, isBefore, isAfter, isToday } from 'date-fns';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const ItemDetails = ({ row, refreshData, snackBar }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [name, setName] = useState(row.item.name);
    const [color, setColor] = useState(row.item.color);
    const [size, setSize] = useState(row.item.size);
    const [category, setCategory] = useState(row.item.category);
    const [material, setMaterial] = useState(row.item.material);
    const [condition, setCondition] = useState(row.item.condition);
    const [distinctiveMarks, setDistinctiveMarks] = useState(row.item.distinctiveMarks);
    const [itemWhereabouts, setItemWhereabouts] = useState(row.item.date_time === "Unidentified" && row.item.location === "Unidentified" ? false : true);
    const [description, setDescription] = useState(row.item.description);
    const [location, setLocation] = useState(!itemWhereabouts ? 'Unidentified' : row.item.location);
    const [foundDate, setFoundDate] = useState(() => {
        if (row.item.isFoundItem) {
            const date = new Date(row.item.date_time);
            date.setHours(date.getHours() + 8); // Adjust to +8 hours if needed
            return date.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
        }
        return "";
    });

    const [lostStartDate, setLostStartDate] = useState(() => {
        if (!row.item.isFoundItem) {
            if (row.item.date_time === 'Unidentified') {
                return row.item.date_time
            } else {
                const [start] = row.item.date_time.split(" to ");
                const startDate = new Date(start);
                startDate.setHours(startDate.getHours() + 8); // Adjust to +8 hours
                return startDate.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
            }
        }
        return ""; // Default value if item is found
    });

    const [lostEndDate, setLostEndDate] = useState(() => {
        if (!row.item.isFoundItem) {
            if (row.item.date_time === 'Unidentified') {
                return row.item.date_time
            } else {
                const [, end] = row.item.date_time.split(" to ");
                const endDate = new Date(end);
                endDate.setHours(endDate.getHours() + 8); // Adjust to +8 hours
                return endDate.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
            }
        }
        return ""; // Default value if item is found
    });
    const [loading, setLoading] = useState(false);

    const locationOptions = ["RLO Building", "FJN Building", "MMN Building", 'Canteen', 'TLC Court'];

    const handleCheckbox = (e) => {
        const check = e.target.checked;
        setItemWhereabouts(check)

        if (itemWhereabouts) {
            setLocation('Unidentified')
        } else {
            if (row.item.location === 'Unidentified') {
                setLocation(null)
            } else {
                setLocation(row.item.location)
            }
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate the found date
            if (row.item.isFoundItem && foundDate) {
                const now = new Date();
                const thirtyDaysAgo = subDays(now, 30);
                const selectedDate = new Date(foundDate);

                if (isBefore(selectedDate, thirtyDaysAgo)) {
                    alert('The found date must be within the last 30 days.');
                    return;
                }

                if (isAfter(selectedDate, now)) {
                    alert('The found date cannot be in the future.');
                    return;
                }
            }

            // Validate lost item dates
            if (!row.item.isFoundItem && lostStartDate && lostEndDate) {
                const start = new Date(lostStartDate);
                const end = new Date(lostEndDate);

                if (start >= end) {
                    alert('The start date must be earlier than the end date.');
                    return;
                }
            }

            // Prepare form data
            const formData = {
                name,
                color,
                size,
                category,
                material,
                condition,
                distinctiveMarks,
                description,
                location,
                date_time: row.item.isFoundItem
                    ? format(new Date(foundDate), 'MMMM dd, yyyy hh:mm a')
                    : itemWhereabouts
                        ? `${format(new Date(lostStartDate), 'MMMM dd, yyyy hh:mm a')} to ${format(new Date(lostEndDate), 'MMMM dd, yyyy hh:mm a')}`
                        : 'Unidentified',
            };

            // API request
            const response = await fetch(
                `/api/${row.item.isFoundItem ? 'found-items' : 'lost-items'}/${row.item._id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update item details.');
            }

            // Refresh and update UI
            await refreshData();
            setIsEditMode(false);
            snackBar(true)
        } catch (error) {
            console.error('Error updating item details:', error);
            alert(error.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <Card
                variant="outlined"
                sx={{
                    maxWidth: 900,
                    margin: 'auto',
                    padding: 3,
                    bgcolor: 'background.surface',
                }}
            >
                {/* Header */}
                <Typography
                    level="h4"
                    textAlign="center"
                    sx={{
                        marginBottom: 3,
                        fontWeight: 'bold',
                        color: 'text.primary',
                    }}
                >
                    Item Details
                </Typography>

                <CardContent>
                    {/* User Information */}
                    <Box sx={{ marginBottom: 4 }}>
                        <Typography
                            level="h5"
                            sx={{
                                marginBottom: 2,
                                fontWeight: 'bold',
                                color: 'primary.plainColor',
                            }}
                        >
                            {row.item.isFoundItem ? 'Finder' : 'Owner'} Information
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                padding: 2,
                                bgcolor: 'background.level1',
                                borderRadius: 'md',
                                boxShadow: 'sm',
                            }}
                        >
                            {/* Avatar */}
                            <Avatar sx={{ width: 80, height: 80 }} />

                            {/* User Details */}
                            <Stack spacing={1} sx={{ flex: 1 }}>
                                <Typography>
                                    <strong>Name:</strong> {row.sender.firstname || row.user?.firstname || 'N/A'} {row.sender.lastname || row.user?.lastname || 'N/A'}
                                </Typography>
                                <Typography>
                                    <strong>Email:</strong> {row.sender.emailAddress || row.user?.emailAddress || 'N/A'}
                                </Typography>
                                <Typography>
                                    <strong>Contact Number:</strong> {row.sender.contactNumber || row.user?.contactNumber || 'N/A'}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>

                    {/* Item Details */}
                    <Box sx={{ marginBottom: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography
                                    level="h5"
                                    sx={{
                                        marginBottom: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.plainColor',
                                    }}
                                >
                                    Item Information
                                </Typography>
                                <Typography>
                                    <Chip
                                        variant='solid'
                                        color={
                                            row.item.status === 'Missing' || row.item.status === "Surrender Pending" || row.item.status === "Request"
                                                ? 'warning'
                                                : row.item.status === "Declined" || row.item.status === "Canceled" || row.item.status === 'Unclaimed'
                                                    ? "danger"
                                                    : row.item.status === "Published" || row.item.status === "Matched"
                                                        ? 'primary'
                                                        : 'success'
                                        }
                                    >
                                        {row.item.status}
                                    </Chip>
                                </Typography>
                            </Box>
                            {(row.item.status === "Missing" || row.item.status === "Published") && (
                                !isEditMode ? (
                                    <Button onClick={() => setIsEditMode(true)}>Edit</Button>
                                ) : (
                                    <Button color="danger" onClick={() => setIsEditMode(false)}>Cancel</Button>
                                )
                            )}

                        </Box>
                        <Box
                            sx={{
                                bgcolor: 'background.level1',
                                borderRadius: 'md',
                                boxShadow: 'sm',
                                padding: 3,
                            }}
                        >
                            <form onSubmit={handleEdit}>
                                <Grid container spacing={3}>
                                    {/* Left Column */}
                                    <Grid item xs={12} md={6}>
                                        {isEditMode ? (
                                            <Input
                                                required
                                                placeholder="Item Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                fullWidth
                                            />
                                        ) : (
                                            <Typography>
                                                <strong>Name:</strong> {row.item.name || 'N/A'}
                                            </Typography>
                                        )}

                                        {isEditMode ? (
                                            <Select
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
                                        ) : (
                                            <Typography>
                                                <strong>Color:</strong> {row.item.color || 'N/A'}
                                            </Typography>
                                        )}

                                        {isEditMode ? (
                                            <Select
                                                fullWidth
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
                                        ) : (
                                            <Typography>
                                                <strong>Size:</strong> {row.item.size || 'N/A'}
                                            </Typography>
                                        )}

                                        {isEditMode ? (
                                            <Select
                                                fullWidth
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
                                        ) : (
                                            <Typography>
                                                <strong>Category:</strong> {row.item.category || 'N/A'}
                                            </Typography>
                                        )}
                                    </Grid>

                                    {/* Right Column */}
                                    <Grid item xs={12} md={6}>
                                        {
                                            isEditMode ?
                                                <Autocomplete
                                                    disabled={!itemWhereabouts}
                                                    required
                                                    placeholder="Select a location"
                                                    options={locationOptions}
                                                    value={location || ""} // Ensure fallback value to avoid undefined
                                                    onChange={(event, value) => {
                                                        setLocation(value || "Unidentified"); // Handle undefined or cleared value
                                                    }}
                                                    getOptionLabel={(option) => option || ""}
                                                    isOptionEqualToValue={(option, value) => option === value || value === "Unidentified"}
                                                />

                                                :
                                                <Typography>
                                                    <strong>Location:</strong> {row.item.location || 'N/A'}
                                                </Typography>
                                        }
                                        {isEditMode ? (
                                            <Select
                                                fullWidth
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
                                        ) : (
                                            <Typography>
                                                <strong>Material:</strong> {row.item.material || 'N/A'}
                                            </Typography>
                                        )}
                                        {isEditMode ? (
                                            <Select
                                                fullWidth
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
                                        ) : (
                                            <Typography>
                                                <strong>Condition:</strong> {row.item.condition || 'N/A'}
                                            </Typography>
                                        )}

                                        {isEditMode ? (
                                            <Select
                                                fullWidth
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
                                        ) : (
                                            <Typography>
                                                <strong>Distinctive Marks:</strong> {row.item.distinctiveMarks || 'N/A'}
                                            </Typography>
                                        )}
                                    </Grid>

                                    {/* Description and Date/Time */}
                                    <Grid item xs={12}>
                                        <Divider sx={{ marginY: 2 }} />
                                        {isEditMode ? (
                                            <Textarea
                                                type="text"
                                                name="description"
                                                minRows={2}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                fullWidth
                                            />
                                        ) : (
                                            <Typography>
                                                <strong>Description:</strong> {row.item.description || 'N/A'}
                                            </Typography>
                                        )}

                                        {row.item.isFoundItem ? (
                                            isEditMode ? (
                                                <>
                                                    <Input
                                                        type="datetime-local"
                                                        value={foundDate} // Use the existing state or initial date
                                                        onChange={(e) => setFoundDate(e.target.value)} // Handle date change for found item
                                                        required
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <Typography>
                                                        <strong>Date:</strong> {new Date(row.item.date_time).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography>
                                                        <strong>Time:</strong> {new Date(row.item.date_time).toLocaleTimeString()}
                                                    </Typography>
                                                </>
                                            )
                                        ) : (
                                            (() => {
                                                const [start, end] = row.item.date_time && row.item.date_time !== 'Unidentified'
                                                    ? row.item.date_time.split(" to ")
                                                    : [null, null];

                                                return isEditMode ? (
                                                    <>
                                                        <Checkbox
                                                            sx={{ my: 2 }}
                                                            label="The owner knows the item's location"
                                                            checked={itemWhereabouts}
                                                            onChange={handleCheckbox} />
                                                        {
                                                            itemWhereabouts &&
                                                            <>
                                                                <Input
                                                                    type="datetime-local"
                                                                    value={lostStartDate} // Use state or initial value
                                                                    onChange={(e) => setLostStartDate(e.target.value)} // Handle start date change
                                                                    required
                                                                />
                                                                <Input
                                                                    type="datetime-local"
                                                                    value={lostEndDate} // Use state or initial value
                                                                    onChange={(e) => setLostEndDate(e.target.value)} // Handle end date change
                                                                    required
                                                                />
                                                            </>
                                                        }
                                                    </>
                                                ) : (
                                                    <>
                                                        <Typography>
                                                            <strong>Start Lost Date:</strong> {start ? `${new Date(start).toLocaleDateString()} ${new Date(start).toLocaleTimeString()}` : 'Unidentified'}
                                                        </Typography>
                                                        <Typography>
                                                            <strong>End Lost Date:</strong> {end ? `${new Date(end).toLocaleDateString()} ${new Date(end).toLocaleTimeString()}` : 'Unidentified'}
                                                        </Typography>
                                                    </>
                                                );
                                            })()
                                        )}
                                    </Grid>

                                    {/* Submit Button */}
                                    {isEditMode && (
                                        <Grid item xs={12}>
                                            <Button disabled={loading} loading={loading} type="submit">
                                                Save Changes
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </form>
                        </Box>
                    </Box>

                    {/* Publishing Details */}
                    <Box sx={{ marginBottom: 4 }}>
                        <Typography
                            level="h5"
                            sx={{
                                marginBottom: 2,
                                fontWeight: 'bold',
                                color: 'primary.plainColor',
                            }}
                        >
                            Item Records
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: 'background.level1',
                                borderRadius: 'md',
                                boxShadow: 'sm',
                                padding: 3,
                            }}
                        >
                            <Stepper orientation="vertical">
                                {row.item.dateRequest && (
                                    <Step>
                                        <Typography>
                                            <strong>Request has been sent!</strong>
                                        </Typography>
                                        <Typography>
                                            {isToday(new Date(row.item.dateRequest))
                                                ? `Today, ${format(new Date(row.item.dateRequest), 'hh:mm a')}`
                                                : format(new Date(row.item.dateRequest), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
                                {row.item.dateValidating && (
                                    <Step>
                                        <Typography>
                                            <strong>The item request has approved!</strong>
                                        </Typography>
                                        <Typography>
                                            {isToday(new Date(row.item.dateValidating))
                                                ? `Today, ${format(new Date(row.item.dateValidating), 'hh:mm a')}`
                                                : format(new Date(row.item.dateValidating), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
                                {row.item.datePublished && (
                                    <Step>
                                        <Typography>
                                            <strong>{row.item.dateRequest ? 'The item was approved!' : 'The item has been published!'}</strong>
                                        </Typography>
                                        <Typography>
                                            {isToday(new Date(row.item.datePublished))
                                                ? `Today, ${format(new Date(row.item.datePublished), 'hh:mm a')}`
                                                : format(new Date(row.item.datePublished), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
                                {row.item.dateMatched && (
                                    <Step>
                                        <Typography>
                                            <strong>The item has been successfully matched!</strong>
                                        </Typography>
                                        <Typography>
                                            {isToday(new Date(row.item.dateMatched))
                                                ? `Today, ${format(new Date(row.item.dateMatched), 'hh:mm a')}`
                                                : format(new Date(row.item.dateMatched), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
                                {row.item.dateMissing && (
                                    <Step>
                                        <Typography>
                                            <strong>The item has been published!</strong>
                                        </Typography>
                                        <Typography>
                                            {isToday(new Date(row.item.dateMissing))
                                                ? `Today, ${format(new Date(row.item.dateMissing), 'hh:mm a')}`
                                                : format(new Date(row.item.dateMissing), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
                                {row.item.dateUnclaimed && (
                                    <Step>
                                        <Typography>
                                            <strong>The item has been tracked!</strong>
                                        </Typography>
                                        <Typography>
                                            {isToday(new Date(row.item.dateUnclaimed))
                                                ? `Today, ${format(new Date(row.item.dateUnclaimed), 'hh:mm a')}`
                                                : format(new Date(row.item.dateUnclaimed), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
                                {row.item.dateCanceled && (
                                    <Step>
                                        <Typography>
                                            <strong>The item has been canceled.</strong>
                                        </Typography>
                                        <Typography>
                                            {isToday(new Date(row.item.dateCanceled))
                                                ? `Today, ${format(new Date(row.item.dateCanceled), 'hh:mm a')}`
                                                : format(new Date(row.item.dateCanceled), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
                                {row.item.dateDeclined && (
                                    <Step>
                                        <Typography>
                                            <strong>The item has been declined.</strong>
                                        </Typography>
                                        <Typography>
                                            <strong>Reason: </strong> {row.item.reason}
                                        </Typography>
                                        <Typography>
                                            {isToday(new Date(row.item.dateDeclined))
                                                ? `Today, ${format(new Date(row.item.dateDeclined), 'hh:mm a')}`
                                                : format(new Date(row.item.dateDeclined), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
                                {(row.item.dateResolved || row.item.dateClaimed) && (
                                    <Step>
                                        <Typography>
                                            <strong>The item has successfully returned to owner!</strong>
                                        </Typography>
                                        <Typography>
                                            {isToday(new Date(row.item.isFoundItem ? row.item.dateResolved : row.item.dateClaimed))
                                                ? `Today, ${format(new Date(row.item.isFoundItem ? row.item.dateResolved : row.item.dateClaimed), 'hh:mm a')}`
                                                : format(new Date(row.item.isFoundItem ? row.item.dateResolved : row.item.dateClaimed), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
                            </Stepper>
                        </Box>
                    </Box>


                    {/* Item Image */}
                    <Box>
                        <Typography
                            level="h5"
                            sx={{
                                marginBottom: 2,
                                fontWeight: 'bold',
                                color: 'primary.plainColor',
                            }}
                        >
                            Item Image
                        </Typography>
                        <Carousel showThumbs={false} useKeyboardArrows>
                            {
                                row.item.images?.map((image, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            overflow: 'hidden',
                                            display: 'inline-block',
                                            cursor: 'pointer',
                                            margin: 1, // Adds some spacing between images
                                        }}
                                        onClick={() => window.open(image || '#', '_blank')}
                                    >
                                        <CldImage
                                            src={image}
                                            width={200}
                                            height={200}
                                            alt={row.item?.name || 'Item Image'}
                                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                        />
                                    </Box>
                                ))
                            }
                        </Carousel>
                    </Box>
                </CardContent>
            </Card >
        </>
    );
};

export default ItemDetails;