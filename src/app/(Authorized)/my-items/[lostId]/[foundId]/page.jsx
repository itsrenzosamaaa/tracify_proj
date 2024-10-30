'use client';

import Loading from '@/app/components/Loading';
import ConfirmationRetrievalRequest from '@/app/components/Modal/ConfirmationRetrievalRequest';
import { Box, Typography, Card, Divider, Stack, Button, Grid } from '@mui/joy';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

const ViewItemPage = ({ params }) => {
    const { lostId, foundId } = params;
    const [items, setItems] = useState({ lostItem: null, foundItem: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null); // Reset error state on each fetch attempt
        try {
            const [lostResponse, foundResponse] = await Promise.all([
                fetch(`/api/lost-items/${lostId}`),
                fetch(`/api/found-items/${foundId}`)
            ]);

            if (!lostResponse.ok || !foundResponse.ok) {
                throw new Error('Failed to fetch item(s)');
            }

            const lostData = await lostResponse.json();
            const foundData = await foundResponse.json();

            setItems({ lostItem: lostData, foundItem: foundData });
        } catch (error) {
            console.error(error);
            setError('Unable to load item details. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [lostId, foundId]);

    useEffect(() => {
        if (lostId && foundId) {
            fetchItems();
        }
    }, [lostId, foundId, fetchItems]);

    if (loading) return <Loading />;
    if (error) return <Typography color="error">{error}</Typography>;

    const { lostItem, foundItem } = items;

    return (
        <>
            {lostItem && foundItem ? (
                <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
                    {/* Found Item Details */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography level="h2">{foundItem.name}</Typography>
                                    <Button onClick={() => router.push('/my-items')} color='danger' aria-label="Back to my items">Back</Button>
                                </Box>
                                <Typography level="body2" color="neutral">
                                    <strong>Status:</strong> {foundItem.status}
                                </Typography>

                                <Box
                                    component="img"
                                    src={foundItem.image}
                                    alt={foundItem.name}
                                    sx={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 'md', boxShadow: 1 }}
                                />

                                <Button onClick={() => setOpen(true)} fullWidth color="success" aria-label="Submit claim request">
                                    Claim Request
                                </Button>

                                <ConfirmationRetrievalRequest open={open} />

                                <Divider />

                                <Typography level="body2" color="neutral">
                                    <strong>Found by:</strong> {foundItem.finder?.firstname} {foundItem.finder?.lastname}
                                </Typography>
                                <Typography level="body2" color="neutral">
                                    <strong>Contact:</strong> {foundItem.finder?.contactNumber}
                                </Typography>
                                <Typography
                                    level="body2"
                                    color="neutral"
                                    sx={{
                                        whiteSpace: { xs: 'nowrap', lg: 'normal' },
                                        overflow: { xs: 'hidden', lg: 'visible' },
                                        textOverflow: { xs: 'ellipsis', lg: 'clip' },
                                        maxWidth: { xs: '200px', lg: 'none' },
                                        display: 'inline-block',
                                    }}
                                >
                                    <strong>Email:</strong> {foundItem.finder?.emailAddress}
                                </Typography>

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
                                <Typography level="body2" color="neutral">
                                    <strong>Published On:</strong> {new Date(foundItem.datePublished).toLocaleDateString()}
                                </Typography>
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        {/* Claim Instructions Card */}
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 2, mb: 2 }}>
                            <Stack spacing={2}>
                                <Typography level="h2">Claim Instructions</Typography>
                                <Divider />
                                <Typography level="body2" color="neutral" textAlign='justify'>
                                    Please come to <strong>{foundItem.monitoredBy.role.name}</strong> which is located at the <strong>{foundItem.monitoredBy.office_location}</strong> during office hours or kindly contact <strong>{foundItem.monitoredBy.role.name}</strong> at <strong>{foundItem.monitoredBy.contactNumber}</strong> or <strong>{foundItem.monitoredBy.emailAddress}</strong>.
                                </Typography>
                            </Stack>
                        </Card>

                        {/* Matched Lost Item Details Card */}
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                            <Stack spacing={2}>
                                <Typography level="h2">Matched Lost Item Details</Typography>
                                <Divider />
                                <Typography level="body2" color="neutral">
                                    <strong>Lost Item Name:</strong> {lostItem.name}
                                </Typography>
                                <Typography level="body2" color="neutral">
                                    <strong>Description:</strong> {lostItem.description}
                                </Typography>
                                <Typography level="body2" color="neutral">
                                    <strong>Date Lost:</strong> {new Date(lostItem.date).toLocaleDateString()}
                                </Typography>
                                <Typography level="body2" color="neutral">
                                    <strong>Location Lost:</strong> {lostItem.location}
                                </Typography>
                            </Stack>
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
