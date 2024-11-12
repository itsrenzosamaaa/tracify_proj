'use client';

import Loading from '@/app/components/Loading';
import ConfirmationRetrievalRequest from '@/app/components/Modal/ConfirmationRetrievalRequest';
import { Box, Typography, Card, Divider, Stack, Button, Grid } from '@mui/joy';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

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

            console.log('Lost Data:', lostData);  // Debug log
            console.log('Found Data:', foundData);  // Debug log

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

    console.log(foundItem)
    console.log(lostItem)

    // If either lostItem or foundItem are null, display a message
    if (!lostItem || !foundItem) {
        return <Typography>No item details available.</Typography>;
    }

    return (
        <>
            <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
                {/* Found Item Details */}
                <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography level="h2">{foundItem?.item?.name}</Typography>
                                <Button onClick={() => router.push('/my-items')} color="danger" aria-label="Back to my items">
                                    Back
                                </Button>
                            </Box>
                            <Typography level="body2" color="neutral">
                                <strong>Status:</strong> {foundItem?.item?.status}
                            </Typography>

                            <Box
                                component="img"
                                src={foundItem?.item?.image}
                                alt={foundItem?.item?.name}
                                sx={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 'md', boxShadow: 1 }}
                            />

                            <Button onClick={() => setOpen(true)} fullWidth color="success" aria-label="Submit claim request">
                                Claim Request
                            </Button>

                            <ConfirmationRetrievalRequest open={open} onClose={() => setOpen(false)} foundItem={foundItem} lostItem={lostItem} />

                            <Divider />

                            <Typography level="body2" color="neutral">
                                <strong>Found by:</strong> {foundItem?.user?.firstname} {foundItem?.user?.lastname}
                            </Typography>
                            <Typography level="body2" color="neutral">
                                <strong>Contact:</strong> {foundItem?.user?.contactNumber}
                            </Typography>
                            <Typography level="body2" color="neutral">
                                <strong>Email:</strong> {foundItem?.user?.emailAddress}
                            </Typography>

                            <Divider />

                            <Typography level="body2" color="neutral">
                                <strong>Description:</strong> {foundItem?.item?.description}
                            </Typography>
                            <Typography level="body2" color="neutral">
                                <strong>Location Found:</strong> {foundItem?.item?.location}
                            </Typography>

                            <Divider />

                            <Typography level="body2" color="neutral">
                                <strong>Date Found:</strong> {new Date(foundItem?.item?.date).toLocaleDateString()}
                            </Typography>
                            <Typography level="body2" color="neutral">
                                <strong>Published On:</strong> {new Date(foundItem?.item?.datePublished).toLocaleDateString()}
                            </Typography>
                        </Stack>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 3, boxShadow: 2, mb: 2 }}>
                        <Stack spacing={2}>
                            <Typography level="h2">Claim Instructions</Typography>
                            <Divider />
                            <Typography level="body2" color="neutral" textAlign="justify">
                                Please come to <strong>{foundItem?.item?.monitoredBy?.role?.name}</strong> which is located at the <strong>{foundItem?.item?.monitoredBy?.office_location}</strong> during office hours or kindly contact <strong>{foundItem?.item?.monitoredBy?.role?.name}</strong> at <strong>{foundItem?.item?.monitoredBy?.contactNumber}</strong> or <strong>{foundItem?.item?.monitoredBy?.emailAddress}</strong>.
                            </Typography>
                        </Stack>
                    </Card>

                    {/* Matched Lost Item Details Card */}
                    <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                        <Stack spacing={2}>
                            <Typography level="h2">Matched Lost Item Details</Typography>
                            <Divider />
                            <Typography level="body2" color="neutral">
                                <strong>Lost Item Name:</strong> {lostItem?.item?.name}
                            </Typography>
                            <Typography level="body2" color="neutral">
                                <strong>Description:</strong> {lostItem?.item?.description}
                            </Typography>
                            <Typography level="body2" color="neutral">
                                <strong>Date Lost:</strong> {new Date(lostItem?.item?.date).toLocaleDateString()}
                            </Typography>
                            <Typography level="body2" color="neutral">
                                <strong>Location Lost:</strong> {lostItem?.item?.location}
                            </Typography>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};

export default ViewItemPage;
