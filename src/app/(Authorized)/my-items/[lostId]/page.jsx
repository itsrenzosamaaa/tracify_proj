'use client';

import Loading from '@/app/components/Loading';
import ConfirmationRetrievalRequest from '@/app/components/Modal/ConfirmationRetrievalRequest';
import { Box, Typography, Card, Divider, Stack, Button, Grid, Chip } from '@mui/joy';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

const ViewItemPage = ({ params }) => {
    const { lostId } = params;
    const [lostItem, setLostItem] = useState(null);
    const [foundItem, setFoundItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    console.log(lostItem)
    console.log(foundItem)

    const fetchFoundItem = useCallback(async (lostItemId) => {
        setError(null);
        try {
            const response = await fetch('/api/found-items');

            if (!response.ok) {
                throw new Error('Failed to fetch matched items');
            }

            const data = await response.json();
            console.log(data)
            const matchedItem = data.find(item => item.matched && item.matched._id === lostItemId);
            setFoundItem(matchedItem);
        } catch (error) {
            console.error(error);
            setError('Unable to load matched item details. Please try again later.');
        }
    }, []);

    const fetchLostItem = useCallback(async () => {
        setError(null);
        try {
            const response = await fetch(`/api/lost-items/${lostId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch item details');
            }

            const data = await response.json();
            setLostItem(data);
        } catch (error) {
            console.error(error);
            setError('Unable to load item details. Please try again later.');
        }
    }, [lostId]);

    useEffect(() => {
        const loadData = async () => {
            if (lostId) {
                setLoading(true);
                try {
                    await fetchLostItem();
                    await fetchFoundItem(lostId);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadData();
    }, [lostId, fetchLostItem, fetchFoundItem]);

    if (loading) return <Loading />;
    if (error) return <Typography color="danger">{error}</Typography>;

    return (
        <>
            {lostItem ? (
                <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
                    {/* Lost Item Details */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography level="h2">{lostItem.name}</Typography>
                                    <Button onClick={() => router.push('/my-items')} color='danger' aria-label="Back to my items">
                                        Back
                                    </Button>
                                </Box>

                                <Typography level="body2" color="neutral">
                                    <strong>Status:</strong> <Chip color={lostItem.status === 'Missing' ? 'danger' : 'success'}>{lostItem.status}</Chip>
                                </Typography>

                                <Box
                                    component="img"
                                    src={lostItem.image}
                                    alt={lostItem.name}
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
                                    <strong>Description:</strong> {lostItem.description}
                                </Typography>
                                <Typography level="body2" color="neutral">
                                    <strong>Location Lost:</strong> {lostItem.location}
                                </Typography>

                                <Divider />

                                <Typography level="body2" color="neutral">
                                    <strong>Date Lost:</strong> {new Date(lostItem.date).toLocaleDateString()}
                                </Typography>
                                <Typography level="body2" color="neutral">
                                    <strong>Lost On:</strong> {new Date(lostItem.dateMissing).toLocaleDateString()}
                                </Typography>
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 4, mb: 2, borderRadius: 2 }}>
                            {foundItem ? (
                                <Stack spacing={3}>
                                    {/* Claim Instructions */}
                                    <Box>
                                        <Typography level="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Claim Instructions</Typography>
                                        <Divider sx={{ mb: 2, borderColor: 'primary.main' }} />
                                        <Typography level="body2" color="text.secondary" textAlign="justify">
                                            Please come to <strong>{foundItem.monitoredBy.role.name}</strong>, located at 
                                            <strong> {foundItem.monitoredBy.office_location}</strong> during office hours. 
                                            You may also contact <strong>{foundItem.monitoredBy.role.name}</strong> at 
                                            <strong> {foundItem.monitoredBy.contactNumber}</strong> or 
                                            <strong> {foundItem.monitoredBy.emailAddress}</strong>.
                                        </Typography>
                                    </Box>

                                    {/* Found Item Details */}
                                    <Box>
                                        <Typography level="h2" sx={{ color: 'success.main', fontWeight: 'bold' }}>Your item has been found!</Typography>
                                        <Divider sx={{ mb: 2, borderColor: 'success.main' }} />
                                        <Typography level="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Found Item Name:</strong> {foundItem.name}
                                        </Typography>
                                        <Typography level="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Description:</strong> {foundItem.description}
                                        </Typography>
                                        <Typography level="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Date Found:</strong> {new Date(foundItem.date).toLocaleDateString()}
                                        </Typography>
                                        <Typography level="body2" color="text.secondary">
                                            <strong>Location Found:</strong> {foundItem.location}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ) : (
                                <Typography color="text.secondary">The item has not been found yet.</Typography>
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