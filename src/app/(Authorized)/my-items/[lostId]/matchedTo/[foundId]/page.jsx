'use client';

import Loading from '@/app/components/Loading';
import ConfirmationRetrievalRequest from '@/app/components/Modal/ConfirmationRetrievalRequest';
import { Box, Typography, Card, Divider, Stack, Button, Grid, Chip, Avatar } from '@mui/joy';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { CldImage } from 'next-cloudinary';
import { useTheme, useMediaQuery } from '@mui/material';

const ViewItemPage = ({ params }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for query params and items
    const [loadingParams, setLoadingParams] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [lostItem, setLostItem] = useState(null);
    const [foundItem, setFoundItem] = useState(null);

    const { lostId, foundId } = params;
    const owner = searchParams.get('owner'); // Assuming 'owner' is a query param
    const finder = searchParams.get('finder'); // Assuming 'finder' is a query param

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));

    // Effect to wait for the params to load
    useEffect(() => {
        if (owner && finder) {
            setLoadingParams(false); // Allow API call once params are available
        }
    }, [owner, finder]);

    // Fetching items based on ids and owner/finder parameters
    const fetchItems = useCallback(async () => {
        if (!owner || !finder || !lostId || !foundId) {
            return; // Skip fetching if required params are missing
        }

        setLoading(true);
        setError(null); // Reset error state on each fetch attempt
        try {
            // Fetch lost item
            const lostResponse = await fetch(`/api/owner/${owner}/items/${lostId}`);
            if (!lostResponse.ok) {
                throw new Error('Failed to fetch lost item');
            }
            const lostData = await lostResponse.json();

            // Fetch found item
            const foundResponse = await fetch(`/api/finder/${finder}/items/${foundId}`);
            if (!foundResponse.ok) {
                throw new Error('Failed to fetch found item');
            }
            const foundData = await foundResponse.json();

            setLostItem(lostData);
            setFoundItem(foundData);
        } catch (error) {
            console.error(error);
            setError('Unable to load item details. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [owner, finder, lostId, foundId]);

    useEffect(() => {
        if (owner && finder && lostId && foundId) {
            fetchItems();
        }
    }, [owner, finder, lostId, foundId, fetchItems]);

    if (loadingParams || loading) return <Loading />;
    if (error) return <Typography color="error">{error}</Typography>;

    // If either lostItem or foundItem are null, display a message
    if (!lostItem || !foundItem) {
        return <Typography>No item details available.</Typography>;
    }

    return (
        <>
            <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
                {/* Found Item Details */}
                <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography level={isXs ? 'h3' : 'h2'}>{foundItem?.item?.name}</Typography>
                                <Button onClick={() => router.push('/my-items#suggested-item')} color="danger" aria-label="Back to my items">
                                    Back
                                </Button>
                            </Box>
                            <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                <strong>Status:</strong>{' '}
                                <Chip variant="solid" color="primary">
                                    {foundItem?.item?.status}
                                </Chip>
                            </Typography>

                            <Carousel showThumbs={false} useKeyboardArrows>
                                {
                                    foundItem?.item.images?.map((image, index) => (
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
                                                alt={foundItem.item?.name || 'Item Image'}
                                                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                            />
                                        </Box>
                                    ))
                                }
                            </Carousel>

                            <Button onClick={() => setOpen(true)} fullWidth color="success" aria-label="Submit claim request">
                                Claim Request
                            </Button>

                            <ConfirmationRetrievalRequest open={open} onClose={() => setOpen(false)} foundItem={foundItem} lostItem={lostItem} />

                            <Divider />

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={2} display='flex' alignItems="center" justifyContent='center'>
                                    <Avatar
                                        alt={`${foundItem.user.firstname} ${foundItem.user.lastname}'s Profile Picture`}
                                        src={foundItem.user.profile_picture}
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: '50%',
                                            boxShadow: 2,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={10}>
                                    <Typography
                                        level={isXs ? 'body-sm' : 'body-md'}
                                        color="neutral"
                                        fontWeight="700"
                                        sx={{
                                            whiteSpace: { xs: 'nowrap' },
                                            overflow: { xs: 'hidden' },
                                            textOverflow: { xs: 'ellipsis' },
                                        }}
                                    >
                                        {foundItem.user.firstname} {foundItem.user.lastname}
                                    </Typography>
                                    <Typography
                                        level={isXs ? 'body-sm' : 'body-md'}
                                        color="neutral"
                                        sx={{
                                            whiteSpace: { xs: 'nowrap' },
                                            overflow: { xs: 'hidden' },
                                            textOverflow: { xs: 'ellipsis' },
                                        }}
                                    >
                                        {foundItem.user.emailAddress}
                                    </Typography>
                                    <Typography
                                        level={isXs ? 'body-sm' : 'body-md'}
                                        color="neutral"
                                        sx={{
                                            whiteSpace: { xs: 'nowrap' },
                                            overflow: { xs: 'hidden' },
                                            textOverflow: { xs: 'ellipsis' },
                                        }}
                                    >
                                        {foundItem.user.contactNumber}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                <strong>Description:</strong> {foundItem.item.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Color:</strong> {foundItem.item.color}
                                    </Typography>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Size:</strong> {foundItem.item.size}
                                    </Typography>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Category:</strong> {foundItem.item.category}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Material:</strong> {foundItem.item.material}
                                    </Typography>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Condition:</strong> {foundItem.item.condition}
                                    </Typography>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Distinctive Marks:</strong> {foundItem.item.distinctiveMarks}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                    <strong>Found Location:</strong> {foundItem.item.location}
                                </Typography>
                                <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                    <strong>Found Date:</strong> {foundItem.item.date_time}
                                </Typography>
                            </Box>
                        </Stack>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    {/* Matched Lost Item Details Card */}
                    <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                        <Stack spacing={2}>
                            <Typography level={isXs ? 'h4' : 'h3'}>Matched Lost Item Details</Typography>
                            <Divider />
                            <Carousel showThumbs={false} useKeyboardArrows>
                                {
                                    lostItem.item?.images?.map((image, index) => (
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
                                                alt={lostItem.item?.name || 'Item Image'}
                                                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                            />
                                        </Box>
                                    ))
                                }
                            </Carousel>

                            <Divider />

                            <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                <strong>Description:</strong> {lostItem.item.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Color:</strong> {lostItem.item.color}
                                    </Typography>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Size:</strong> {lostItem.item.size}
                                    </Typography>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Category:</strong> {lostItem.item.category}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Material:</strong> {lostItem.item.material}
                                    </Typography>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Condition:</strong> {lostItem.item.condition}
                                    </Typography>
                                    <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                        <strong>Distinctive Marks:</strong> {lostItem.item.distinctiveMarks}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                    <strong>Lost Location:</strong> {lostItem.item.location}
                                </Typography>
                                <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                    <strong>Start Lost Date:</strong> {lostItem.item.date_time?.split(' to ')[0] || 'Unidentified'}
                                </Typography>
                                <Typography level={isXs ? 'body-sm' : 'body-md'} color="neutral">
                                    <strong>End Lost Date:</strong> {lostItem.item.date_time?.split(' to ')[1] || 'Unidentified'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};

export default ViewItemPage;
