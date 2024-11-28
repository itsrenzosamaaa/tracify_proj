'use client';

import Loading from '@/app/components/Loading';
import { Box, Typography, Card, Divider, Stack, Button, Grid, Chip, Stepper, Step, StepIndicator } from '@mui/joy';
import { StepLabel, StepContent } from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { format, isToday } from 'date-fns';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { CldImage } from 'next-cloudinary';
import { FindInPage } from '@mui/icons-material';
import { useMediaQuery, useTheme } from '@mui/material';
import FoundItemsPage from '@/app/(Authorized)/found-items/page';

const ViewItemPage = ({ params }) => {
    const { foundId } = params;
    const [foundItem, setFoundItem] = useState(null);
    const [lostItem, setLostItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));

    console.log(lostItem)

    const fetchLostItem = useCallback(async (foundItemId) => {
        setError(null);
        try {
            const response = await fetch('/api/match-items');
            if (!response.ok) {
                throw new Error('Failed to fetch matched items');
            }

            const data = await response.json();

            const findLostItem = data.find(lostItem => lostItem?.finder?.item?._id === foundItemId && (lostItem.request_status === 'Pending' || lostItem.owner.item.status === 'Unclaimed'))
            setLostItem(findLostItem);
        } catch (error) {
            console.error(error);
            setError('Unable to load matched item details. Please try again later.');
        }
    }, []);

    const fetchFoundItem = useCallback(async () => {
        setError(null);
        try {
            const response = await fetch(`/api/found-items/${foundId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch item details');
            }

            const data = await response.json();
            setFoundItem(data);
        } catch (error) {
            console.error(error);
            setError('Unable to load item details. Please try again later.');
        }
    }, [foundId]);

    useEffect(() => {
        const loadData = async () => {
            if (foundId) {
                setLoading(true);
                try {
                    await fetchFoundItem();
                    await fetchLostItem(foundId);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadData();
    }, [foundId, fetchFoundItem, fetchLostItem]);

    if (loading) return <Loading />;
    if (error) return <Typography color="danger">{error}</Typography>;

    return (
        <>
            {foundItem ? (
                <Grid container spacing={2} sx={{ maxWidth: 1200, mx: 'auto' }}>
                    {foundItem.status === 'Surrender Pending' && (
                        <Grid container spacing={2}>
                            {/* Full-width Card containing details and the stepper */}
                            <Grid item xs={12}>
                                <Card variant="outlined" sx={{ p: 3, boxShadow: 2, maxWidth: '100%', mx: 'auto', overflow: 'hidden' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography
                                            level={isXs ? 'h3' : 'h2'}
                                            sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}
                                        >
                                            Surrender Instructions
                                        </Typography>
                                        <Button onClick={() => router.push('/my-items#found-item')} color="danger" aria-label="Back to my items">
                                            Back
                                        </Button>
                                    </Box>
                                    <Divider sx={{ mb: 3, borderColor: 'primary.main' }} />

                                    <Grid container spacing={2} alignItems="flex-start">
                                        {/* Left Side: Surrender Details */}
                                        <Grid item xs={12} md={4}>
                                            <Box>
                                                {/* Introduction */}
                                                <Typography level={isXs ? 'body-sm' : 'body-md'} sx={{ mb: 2 }}>
                                                    Please surrender the item to{' '}
                                                    <strong>{foundItem.monitoredBy?.role.name}</strong>{' '}
                                                    located at the{' '}
                                                    <strong>{foundItem.monitoredBy.office_location}</strong>
                                                    . For more information, you may contact{' '}
                                                    <strong>{foundItem.monitoredBy.role.name}</strong> at:
                                                </Typography>

                                                <ul>
                                                    <li>
                                                        <strong>Email: </strong>
                                                        {foundItem.monitoredBy.emailAddress}
                                                    </li>
                                                    <li>
                                                        <strong>Contact Number: </strong>
                                                        {foundItem.monitoredBy.contactNumber}
                                                    </li>
                                                </ul>
                                            </Box>
                                        </Grid>

                                        {/* Vertical Divider */}
                                        <Divider
                                            orientation="vertical"
                                            flexItem
                                            sx={{ display: { xs: 'none', md: 'block' } }}
                                        />

                                        {/* Right Side: Stepper */}
                                        <Grid item xs={12} md={7}>
                                            <Stepper
                                                level={isXs ? 'sm' : 'md'}
                                                orientation={isSmallScreen ? 'vertical' : 'horizontal'}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: isSmallScreen ? 'column' : 'row',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {/* Step 1 */}
                                                <Step
                                                    orientation="vertical"
                                                    indicator={
                                                        <StepIndicator variant="solid" color="neutral">
                                                            1
                                                        </StepIndicator>
                                                    }
                                                >
                                                    <Box
                                                        sx={{
                                                            textAlign: isSmallScreen ? 'left' : 'center',
                                                            maxWidth: { xs: '100%', md: 200 },
                                                        }}
                                                    >
                                                        <Typography level={isXs ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', mb: 1 }}>
                                                            Visit the Office
                                                        </Typography>
                                                        <Typography level={isXs ? 'body-sm' : 'body-md'} sx={{ color: 'text.secondary' }}>
                                                            Go to the designated office to surrender the item.
                                                        </Typography>
                                                    </Box>
                                                </Step>

                                                {/* Step 2 */}
                                                <Step
                                                    orientation="vertical"
                                                    indicator={
                                                        <StepIndicator variant="solid" color="neutral">
                                                            2
                                                        </StepIndicator>
                                                    }
                                                >
                                                    <Box
                                                        sx={{
                                                            textAlign: isSmallScreen ? 'left' : 'center',
                                                            maxWidth: { xs: '100%', md: 200 },
                                                        }}
                                                    >
                                                        <Typography level={isXs ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', mb: 1 }}>
                                                            Contact the Person-in-Charge
                                                        </Typography>
                                                        <Typography level={isXs ? 'body-sm' : 'body-md'} sx={{ color: 'text.secondary' }}>
                                                            Reach out to the officer in charge for further assistance.
                                                        </Typography>
                                                    </Box>
                                                </Step>

                                                {/* Step 3 */}
                                                <Step
                                                    orientation="vertical"
                                                    indicator={
                                                        <StepIndicator variant="solid" color="neutral">
                                                            3
                                                        </StepIndicator>
                                                    }
                                                >
                                                    <Box
                                                        sx={{
                                                            textAlign: isSmallScreen ? 'left' : 'center',
                                                            maxWidth: { xs: '100%', md: 200 },
                                                        }}
                                                    >
                                                        <Typography level={isXs ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', mb: 1 }}>
                                                            Confirm the Surrender
                                                        </Typography>
                                                        <Typography level={isXs ? 'body-sm' : 'body-md'} sx={{ color: 'text.secondary' }}>
                                                            Confirm the item has been surrendered to complete the process.
                                                        </Typography>
                                                    </Box>
                                                </Step>
                                            </Stepper>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                    {/* Found Item Details */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography level={isXs ? 'h3' : 'h2'}>{foundItem.name}</Typography>
                                    {
                                        foundItem.status !== 'Surrender Pending' &&
                                        <Button onClick={() => router.push('/my-items#found-item')} color="danger" aria-label="Back to my items">
                                            Back
                                        </Button>
                                    }
                                </Box>
                                <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                    <strong>Status:</strong>{' '}
                                    <Chip
                                        variant="solid"
                                        color={foundItem.status === 'Published' ? 'primary' : foundItem.status === 'Surrender Pending' ? 'warning' : 'success'}
                                    >
                                        {foundItem.status}
                                    </Chip>
                                </Typography>
                                <Carousel showThumbs={false} useKeyboardArrows>
                                    {
                                        foundItem?.images?.map((image, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    overflow: 'hidden',
                                                    display: 'inline-block',
                                                    margin: 1, // Adds some spacing between images
                                                }}
                                            >
                                                <CldImage
                                                    src={image}
                                                    width={250}
                                                    height={250}
                                                    alt={foundItem?.name || 'Item Image'}
                                                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                                />
                                            </Box>
                                        ))
                                    }
                                </Carousel>
                                <Divider />

                                <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                    <strong>Description:</strong> {foundItem.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                            <strong>Color:</strong> {foundItem.color}
                                        </Typography>
                                        <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                            <strong>Size:</strong> {foundItem.size}
                                        </Typography>
                                        <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                            <strong>Category:</strong> {foundItem.category}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                            <strong>Material:</strong> {foundItem.material}
                                        </Typography>
                                        <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                            <strong>Condition:</strong> {foundItem.condition}
                                        </Typography>
                                        <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                            <strong>Distinctive Marks:</strong> {foundItem.distinctiveMarks}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Found Location:</strong> {foundItem.location}
                                    </Typography>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Found Date:</strong> {foundItem.date_time}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ marginBottom: 4 }}>
                                    <Stepper orientation="vertical">
                                        {foundItem.dateRequest && (
                                            <Step>
                                                <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                                    <strong>Request has been sent!</strong>
                                                </Typography>
                                                <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                                    {isToday(new Date(foundItem.dateRequest))
                                                        ? `Today, ${format(new Date(foundItem.dateRequest), 'hh:mm a')}`
                                                        : format(new Date(foundItem.dateRequest), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {foundItem.dateValidating && (
                                            <Step>
                                                <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                                    <strong>Your item has been approved! Please surrender the item to {foundItem.monitoredBy.role.name}</strong>
                                                </Typography>
                                                <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                                    {isToday(new Date(foundItem.dateValidating))
                                                        ? `Today, ${format(new Date(foundItem.dateValidating), 'hh:mm a')}`
                                                        : format(new Date(foundItem.dateValidating), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {foundItem.datePublished && (
                                            <Step>
                                                <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                                    <strong>Your item has been published!</strong>
                                                </Typography>
                                                <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                                    {isToday(new Date(foundItem.datePublished))
                                                        ? `Today, ${format(new Date(foundItem.datePublished), 'hh:mm a')}`
                                                        : format(new Date(foundItem.datePublished), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {foundItem.dateMatched && (
                                            <Step>
                                                <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                                    <strong>The item has been successfully matched!</strong>
                                                </Typography>
                                                <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                                    {isToday(new Date(foundItem.dateMatched))
                                                        ? `Today, ${format(new Date(foundItem.dateMatched), 'hh:mm a')}`
                                                        : format(new Date(foundItem.dateMatched), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {(foundItem.dateResolved) && (
                                            <Step>
                                                <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                                    <strong>The item has successfully returned to owner!</strong>
                                                </Typography>
                                                <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                                    {isToday(new Date(foundItem.isFoundItem ? foundItem.dateResolved : foundItem.dateClaimed))
                                                        ? `Today, ${format(new Date(foundItem.isFoundItem ? foundItem.dateResolved : foundItem.dateClaimed), 'hh:mm a')}`
                                                        : format(new Date(foundItem.isFoundItem ? foundItem.dateResolved : foundItem.dateClaimed), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                    </Stepper>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                    {/* Matched Lost Item Details */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 4, mb: 2 }}>
                            {lostItem ? (
                                <Stack spacing={2}>
                                    <Typography level={isXs ? 'h4' : 'h3'} sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                        Matched Lost Item
                                    </Typography>
                                    <Carousel showThumbs={false} useKeyboardArrows>
                                        {
                                            lostItem.owner.item?.images?.map((image, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        overflow: 'hidden',
                                                        display: 'inline-block',
                                                        margin: 1, // Adds some spacing between images
                                                    }}
                                                >
                                                    <CldImage
                                                        src={image}
                                                        width={250}
                                                        height={250}
                                                        alt={lostItem.owner.item?.name || 'Item Image'}
                                                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                                    />
                                                </Box>
                                            ))
                                        }
                                    </Carousel>

                                    <Divider />

                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Description:</strong> {lostItem.owner.item.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                                <strong>Color:</strong> {lostItem.owner.item.color}
                                            </Typography>
                                            <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                                <strong>Size:</strong> {lostItem.owner.item.size}
                                            </Typography>
                                            <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                                <strong>Category:</strong> {lostItem.owner.item.category}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                                <strong>Material:</strong> {lostItem.owner.item.material}
                                            </Typography>
                                            <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                                <strong>Condition:</strong> {lostItem.owner.item.condition}
                                            </Typography>
                                            <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                                <strong>Distinctive Marks:</strong> {lostItem.owner.item.distinctiveMarks}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Divider />
                                    <Box>
                                        <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                            <strong>Lost Location:</strong> {lostItem.owner.item.location}
                                        </Typography>
                                        <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                            <strong>Start Lost Date:</strong> {lostItem.owner.item.date_time?.split(' to ')[0] || 'Unidentified'}
                                        </Typography>
                                        <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                            <strong>End Lost Date:</strong> {lostItem.owner.item.date_time?.split(' to ')[1] || 'Unidentified'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ) : (
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        p: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 2,
                                        boxShadow: 3, // Adds some depth
                                    }}
                                >
                                    <FindInPage sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                    <Typography
                                        color="text.primary"
                                        sx={{ fontSize: '1.4rem', fontWeight: 'bold', mb: 1 }}
                                    >
                                        No Match Found
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        sx={{ fontSize: '1rem' }}
                                    >
                                        We&apos;re still looking for a match. Please check back later!
                                    </Typography>
                                </Box>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            ) : (
                <Typography>No item details available.</Typography>
            )}
        </>
    );
};

export default ViewItemPage;
