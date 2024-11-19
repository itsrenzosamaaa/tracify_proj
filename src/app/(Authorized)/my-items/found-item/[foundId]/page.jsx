'use client';

import Loading from '@/app/components/Loading';
import { Box, Typography, Card, Divider, Stack, Button, Grid, Chip, Stepper, Step } from '@mui/joy';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { format, isToday } from 'date-fns';

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
                <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
                    {/* Found Item Details */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography level="h2">{foundItem.name}</Typography>
                                    <Button onClick={() => router.push('/my-items')} color="danger" aria-label="Back to my items">
                                        Back
                                    </Button>
                                </Box>
                                <Typography level="body2" color="neutral">
                                    <strong>Status:</strong>{' '}
                                    <Chip
                                        variant="solid"
                                        color={foundItem.status === 'Published' ? 'primary' : foundItem.status === 'Validating' ? 'warning' : 'success'}
                                    >
                                        {foundItem.status}
                                    </Chip>
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
                                        boxShadow: 1,
                                    }}
                                />
                                <Divider />

                                <Typography level="body2" color="neutral">
                                    <strong>Description:</strong> {foundItem.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography level="body2" color="neutral">
                                            <strong>Color:</strong> {foundItem.color}
                                        </Typography>
                                        <Typography level="body2" color="neutral">
                                            <strong>Size:</strong> {foundItem.size}
                                        </Typography>
                                        <Typography level="body2" color="neutral">
                                            <strong>Category:</strong> {foundItem.category}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography level="body2" color="neutral">
                                            <strong>Material:</strong> {foundItem.material}
                                        </Typography>
                                        <Typography level="body2" color="neutral">
                                            <strong>Condition:</strong> {foundItem.condition}
                                        </Typography>
                                        <Typography level="body2" color="neutral">
                                            <strong>Distinctive Marks:</strong> {foundItem.distinctiveMarks}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography level="body2" color="neutral">
                                        <strong>Surrender Location:</strong> {foundItem.monitoredBy.role.name}
                                    </Typography>
                                    <Typography level="body2" color="neutral">
                                        <strong>Found Location:</strong> {foundItem.location}
                                    </Typography>
                                    <Typography level="body2" color="neutral">
                                        <strong>Found Date:</strong> {foundItem.date_time}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ marginBottom: 4 }}>
                                    <Stepper orientation="vertical">
                                        {foundItem.dateRequest && (
                                            <Step>
                                                <Typography>
                                                    <strong>Request has been sent!</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(foundItem.dateRequest))
                                                        ? `Today, ${format(new Date(foundItem.dateRequest), 'hh:mm a')}`
                                                        : format(new Date(foundItem.dateRequest), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {foundItem.dateValidating && (
                                            <Step>
                                                <Typography>
                                                    <strong>Your item has been approved! Please surrender the item to {foundItem.monitoredBy.role.name}</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(foundItem.dateValidating))
                                                        ? `Today, ${format(new Date(foundItem.dateValidating), 'hh:mm a')}`
                                                        : format(new Date(foundItem.dateValidating), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {foundItem.datePublished && (
                                            <Step>
                                                <Typography>
                                                    <strong>Your item has been published!</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(foundItem.datePublished))
                                                        ? `Today, ${format(new Date(foundItem.datePublished), 'hh:mm a')}`
                                                        : format(new Date(foundItem.datePublished), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {foundItem.dateMatched && (
                                            <Step>
                                                <Typography>
                                                    <strong>The item has been successfully matched!</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(foundItem.dateMatched))
                                                        ? `Today, ${format(new Date(foundItem.dateMatched), 'hh:mm a')}`
                                                        : format(new Date(foundItem.dateMatched), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {(foundItem.dateResolved) && (
                                            <Step>
                                                <Typography>
                                                    <strong>The item has successfully returned to owner!</strong>
                                                </Typography>
                                                <Typography>
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
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 4, mb: 2, borderRadius: 2 }}>
                            {foundItem.status === 'Surrender Pending' ? (
                                <Stack spacing={2}>
                                    <Typography level="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Surrender Instructions</Typography>
                                    <Divider sx={{ mb: 2, borderColor: 'primary.main' }} />
                                    <Typography level="body2" color="text.secondary" textAlign="justify">
                                        To surrender the item, please visit <strong>{foundItem?.monitoredBy?.role.name}</strong> at
                                        <strong> {foundItem?.monitoredBy?.office_location}</strong> during office hours. For inquiries 
                                        or further assistance, you may contact <strong>{foundItem?.monitoredBy?.role.name}</strong> at:
                                    </Typography>
                                    <ul>
                                        <li>
                                            <Typography level="body2" color="text.secondary">
                                                Phone: <strong>{foundItem?.monitoredBy?.contactNumber}</strong>
                                            </Typography>
                                        </li>
                                        <li>
                                            <Typography level="body2" color="text.secondary">
                                                Email: <strong>{foundItem?.monitoredBy?.emailAddress}</strong>
                                            </Typography>
                                        </li>
                                    </ul>
                                    <Typography level="body2" color="text.secondary" textAlign="justify">
                                        Thank you for helping to ensure the item is returned to its rightful owner.
                                    </Typography>
                                </Stack>

                            ) : lostItem ? (
                                <Stack spacing={2}>
                                    <Typography level="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                        Matched Lost Item
                                    </Typography>
                                    <Box
                                        component="img"
                                        src={lostItem.owner.item.image}
                                        alt={lostItem.owner.item.name}
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
                                        <strong>Description:</strong> {lostItem.owner.item.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography level="body2" color="neutral">
                                                <strong>Color:</strong> {lostItem.owner.item.color}
                                            </Typography>
                                            <Typography level="body2" color="neutral">
                                                <strong>Size:</strong> {lostItem.owner.item.size}
                                            </Typography>
                                            <Typography level="body2" color="neutral">
                                                <strong>Category:</strong> {lostItem.owner.item.category}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography level="body2" color="neutral">
                                                <strong>Material:</strong> {lostItem.owner.item.material}
                                            </Typography>
                                            <Typography level="body2" color="neutral">
                                                <strong>Condition:</strong> {lostItem.owner.item.condition}
                                            </Typography>
                                            <Typography level="body2" color="neutral">
                                                <strong>Distinctive Marks:</strong> {lostItem.owner.item.distinctiveMarks}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Divider />
                                    <Box>
                                        <Typography level="body2" color="neutral">
                                            <strong>Lost Location:</strong> {lostItem.owner.item.location}
                                        </Typography>
                                        <Typography level="body2" color="neutral">
                                            <strong>Start Lost Date:</strong> {lostItem.owner.item.date_time?.split(' to ')[0] || 'Unidentified'}
                                        </Typography>
                                        <Typography level="body2" color="neutral">
                                            <strong>End Lost Date:</strong> {lostItem.owner.item.date_time?.split(' to ')[1] || 'Unidentified'}
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
