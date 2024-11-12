'use client';

import Loading from '@/app/components/Loading';
import { Box, Typography, Card, Divider, Stack, Button, Grid, Chip } from '@mui/joy';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

const ViewItemPage = ({ params }) => {
    const { foundId } = params;
    const [foundItem, setFoundItem] = useState(null);
    const [lostItem, setLostItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    console.log(lostItem)

    const fetchLostItem = useCallback(async (foundItemId) => {
        setError(null);
        try {
            const response = await fetch('/api/match-items');
            if (!response.ok) {
                throw new Error('Failed to fetch matched items');
            }

            const data = await response.json();
            console.log(data);
            
            const findLostItem = data.find(lostItem => lostItem?.finder?.item?._id === foundItemId)
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
                <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
                    {/* Found Item Details */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography level="h2">{foundItem.name}</Typography>
                                    <Button onClick={() => router.push('/my-items')} color='danger' aria-label="Back to my items">
                                        Back
                                    </Button>
                                </Box>

                                <Typography level="body2" color="neutral">
                                    <strong>Status:</strong> <Chip variant="solid" color={foundItem.status === 'Published' ? 'primary' : foundItem.status === 'Validating' ? 'warning' : 'success'}>{foundItem.status}</Chip>
                                </Typography>

                                <Box
                                    component="img"
                                    src={foundItem.image}
                                    alt={foundItem.name}
                                    sx={{ 
                                        width: '100%', 
                                        height: 250, 
                                        objectFit: 'cover', 
                                        borderRadius: 'md', 
                                        boxShadow: 1 
                                    }}
                                />

                                <Divider />

                                <Typography level="body2" color="neutral">
                                    <strong>Description:</strong> {foundItem.description}
                                </Typography>
                                <Typography level="body2" color="neutral">
                                    <strong>Location Found:</strong> {foundItem.location}
                                </Typography>

                                <Divider />

                                <Typography level="body2" color="neutral">
                                    <strong>Date Found:</strong> {new Date(foundItem.date).toLocaleDateString()}
                                </Typography>
                            </Stack>
                        </Card>
                    </Grid>

                    {/* Lost Item (If available) */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 4, mb: 2, borderRadius: 2 }}>
                            {lostItem ? (
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography level="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Matched Lost Item</Typography>
                                        <Divider sx={{ mb: 2, borderColor: 'primary.main' }} />
                                        <Typography level="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Lost Item Name:</strong> {lostItem?.owner?.item?.name}
                                        </Typography>
                                        <Typography level="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Description:</strong> {lostItem?.owner?.item?.description}
                                        </Typography>
                                        <Typography level="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Location Lost:</strong> {lostItem?.owner?.item?.location}
                                        </Typography>
                                        <Typography level="body2" color="text.secondary">
                                            <strong>Date Lost:</strong> {new Date(lostItem?.owner?.item?.date).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ) : (
                                <Typography color="text.secondary">No matched lost item available.</Typography>
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
