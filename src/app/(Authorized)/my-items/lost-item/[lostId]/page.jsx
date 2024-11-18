'use client';

import Loading from '@/app/components/Loading';
import { Box, Typography, Card, Divider, Stack, Button, Grid, Chip, Stepper, Step } from '@mui/joy';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { isToday, format } from 'date-fns';

const formatDate = (date, fallback = 'Unidentified') => {
    if (!date) return fallback;
    try {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(date));
    } catch {
        return fallback;
    }
};

const ViewItemPage = ({ params }) => {
    const { lostId } = params;
    const [lostItem, setLostItem] = useState(null);
    const [foundItem, setFoundItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const fetchFoundItem = useCallback(async (lostItemId) => {
        setError(null);
        try {
            const response = await fetch('/api/match-items');

            if (!response.ok) {
                throw new Error('Failed to fetch matched items');
            }

            const data = await response.json();
            const findFoundItem = data.find(foundItem => foundItem?.owner?.item?._id === lostItemId);
            setFoundItem(findFoundItem);
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
                <Grid container spacing={2} sx={{ maxWidth: 1200, mx: 'auto' }}>
                    {/* Lost Item Details */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography level="h2">{lostItem.name}</Typography>
                                    <Button onClick={() => router.push('/my-items')} color="danger" aria-label="Back to my items">
                                        Back
                                    </Button>
                                </Box>

                                <Typography level="body2" color="neutral">
                                    <strong>Status:</strong> <Chip variant="solid" color={lostItem.status === 'Missing' ? 'danger' : 'success'}>{lostItem.status}</Chip>
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
                                        boxShadow: 1,
                                    }}
                                />

                                <Divider />

                                <Typography level="body2" color="neutral">
                                    <strong>Description:</strong> {lostItem.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography level="body2" color="neutral">
                                            <strong>Color:</strong> {lostItem.color}
                                        </Typography>
                                        <Typography level="body2" color="neutral">
                                            <strong>Size:</strong> {lostItem.size}
                                        </Typography>
                                        <Typography level="body2" color="neutral">
                                            <strong>Category:</strong> {lostItem.category}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography level="body2" color="neutral">
                                            <strong>Material:</strong> {lostItem.material}
                                        </Typography>
                                        <Typography level="body2" color="neutral">
                                            <strong>Condition:</strong> {lostItem.condition}
                                        </Typography>
                                        <Typography level="body2" color="neutral">
                                            <strong>Distinctive Marks:</strong> {lostItem.distinctiveMarks}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography level="body2" color="neutral">
                                        <strong>Location Lost:</strong> {lostItem.location}
                                    </Typography>
                                    <Typography level="body2" color="neutral">
                                        <strong>Lost Start Date:</strong> {formatDate(lostItem.date_time?.split(' to ')[0])}
                                    </Typography>
                                    <Typography level="body2" color="neutral">
                                        <strong>Lost End Date:</strong> {formatDate(lostItem.date_time?.split(' to ')[1])}
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box sx={{ marginBottom: 4 }}>
                                    <Stepper orientation="vertical">
                                        {lostItem.dateRequest && (
                                            <Step>
                                                <Typography>
                                                    <strong>Request has been sent!</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(lostItem.dateRequest))
                                                        ? `Today, ${format(new Date(lostItem.dateRequest), 'hh:mm a')}`
                                                        : format(new Date(lostItem.dateRequest), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {lostItem.dateMissing && (
                                            <Step>
                                                <Typography>
                                                    <strong>{lostItem.dateRequest ? 'The item was approved!' : 'The item has been published!'}</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(lostItem.dateMissing))
                                                        ? `Today, ${format(new Date(lostItem.dateMissing), 'hh:mm a')}`
                                                        : format(new Date(lostItem.dateMissing), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {lostItem.dateUnclaimed && (
                                            <Step>
                                                <Typography>
                                                    <strong>The item has been tracked!</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(lostItem.dateUnclaimed))
                                                        ? `Today, ${format(new Date(lostItem.dateUnclaimed), 'hh:mm a')}`
                                                        : format(new Date(lostItem.dateUnclaimed), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {(lostItem.dateClaimed) && (
                                            <Step>
                                                <Typography>
                                                    <strong>The item has successfully returned to owner!</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(lostItem.isFoundItem ? lostItem.dateResolved : lostItem.dateClaimed))
                                                        ? `Today, ${format(new Date(lostItem.isFoundItem ? lostItem.dateResolved : lostItem.dateClaimed), 'hh:mm a')}`
                                                        : format(new Date(lostItem.isFoundItem ? lostItem.dateResolved : lostItem.dateClaimed), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                    </Stepper>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>

                    {/* Found Item Details */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 4, mb: 2, borderRadius: 2 }}>
                            {foundItem && lostItem.status !== 'Missing' ? (
                                <Stack spacing={3}>
                                    {/* Claim Instructions */}
                                    <Box>
                                        <Typography level="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Claim Instructions</Typography>
                                        <Divider sx={{ mb: 2, borderColor: 'primary.main' }} />
                                        <Typography level="body2" color="text.secondary" textAlign="justify">
                                            To claim your item, please visit <strong>{foundItem.finder?.item?.monitoredBy?.role.name}</strong> office located at
                                            <strong> {foundItem.finder?.item?.monitoredBy?.office_location}</strong> during office hours. Be sure to bring any relevant identification or documentation for verification.
                                        </Typography>
                                        <Typography level="body2" color="text.secondary" textAlign="justify">
                                            For further assistance, you may contact <strong>{foundItem.finder?.item?.monitoredBy?.role.name}</strong> via:
                                        </Typography>
                                        <ul>
                                            <li>
                                                <Typography level="body2" color="text.secondary">
                                                    Phone: <strong>{foundItem.finder?.item?.monitoredBy?.contactNumber}</strong>
                                                </Typography>
                                            </li>
                                            <li>
                                                <Typography level="body2" color="text.secondary">
                                                    Email: <strong>{foundItem.finder?.item?.monitoredBy?.emailAddress}</strong>
                                                </Typography>
                                            </li>
                                        </ul>
                                    </Box>

                                    {/* Found Item Details */}
                                    <Box>
                                        <Typography level="h2" sx={{ color: 'success.main', fontWeight: 'bold' }}>Your Item Has Been Found!</Typography>
                                        <Divider sx={{ mb: 2, borderColor: 'success.main' }} />
                                        <Typography level="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Item Name:</strong> {foundItem?.finder?.item?.name}
                                        </Typography>
                                        <Typography level="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Description:</strong> {foundItem?.finder?.item?.description}
                                        </Typography>
                                        <Typography level="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Date Found:</strong> {formatDate(foundItem?.finder?.item?.date)}
                                        </Typography>
                                        <Typography level="body2" color="text.secondary">
                                            <strong>Location Found:</strong> {foundItem?.finder?.item?.location}
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
