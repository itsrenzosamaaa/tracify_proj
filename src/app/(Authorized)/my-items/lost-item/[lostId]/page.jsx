'use client';

import Loading from '@/app/components/Loading';
import { Box, Typography, Card, Divider, Stack, Button, Grid, Chip, Stepper, Step, Avatar } from '@mui/joy';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { isToday, format } from 'date-fns';
import CancelRetrievalRequest from '@/app/components/Modal/CancelRetrievalRequest';

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
    const [cancelModal, setCancelModal] = useState(null);
    const router = useRouter();

    console.log(foundItem)

    const fetchFoundItem = useCallback(async (lostItemId) => {
        setError(null);
        try {
            const response = await fetch('/api/match-items');

            if (!response.ok) {
                throw new Error('Failed to fetch matched items');
            }

            const data = await response.json();
            const findFoundItem = data.find(foundItem => foundItem?.owner?.item?._id === lostItemId && (foundItem.request_status === 'Pending' || foundItem.owner.item.status === 'Unclaimed'));
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
                                    <strong>Status:</strong> <Chip variant="solid" color="danger">{lostItem.status}</Chip>
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
                            {foundItem ? (
                                <Stack spacing={3}>
                                    {/* Claim Instructions */}
                                    {
                                        lostItem.status === 'Unclaimed' &&
                                        <Box>
                                            <Typography level="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Claim Instructions</Typography>
                                            <Divider sx={{ mb: 2, borderColor: 'primary.main' }} />
                                            <Typography level="body2" color="text.secondary" textAlign="justify">
                                                To claim your item, please visit <strong>{foundItem.finder?.item?.monitoredBy?.role.name}</strong> office located at
                                                <strong> {foundItem.finder?.item?.monitoredBy?.office_location}</strong> during office hours. Be sure to bring any relevant identification or documentation for verification.
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
                                            <Typography level="body2" color="error" textAlign="justify" sx={{ my: 2, fontWeight: 'bold' }}>
                                                <strong>Reminder:</strong> Falsely claiming an item that does not belong to you is a serious offense and may result in consequences such as suspension. If the item does not belong to you, you may cancel the retrieval process.
                                            </Typography>
                                            <Button color="danger" fullWidth>Cancel Retrieval</Button>
                                        </Box>
                                    }

                                    {/* Found Item Details */}
                                    <Box>
                                        <Stack spacing={2}>
                                            <Typography level="h2" sx={{ color: 'success.main', fontWeight: 'bold' }}>{lostItem.status === 'Missing' ? 'Potential Matched Item' : 'Your Item Has Been Found!'}</Typography>
                                            <Box
                                                component="img"
                                                src={foundItem.finder.item.image}
                                                alt={foundItem.finder.item.name}
                                                sx={{
                                                    width: '100%',
                                                    height: 250,
                                                    objectFit: 'cover',
                                                    borderRadius: 'md',
                                                    boxShadow: 1,
                                                }}
                                            />

                                            {
                                                foundItem.request_status === 'Pending' &&
                                                <>
                                                    <Button fullWidth color='danger' onClick={() => setCancelModal(foundItem._id)}>Cancel Retrieval Request</Button>
                                                    <CancelRetrievalRequest open={cancelModal} onClose={() => setCancelModal(null)} matchItem={foundItem} />
                                                </>
                                            }

                                            <Divider />

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ width: 50, height: 50 }} />
                                                <Box>
                                                    <Typography level="body2" color="neutral">
                                                        <strong>Finder:</strong> {foundItem.finder.user.firstname} {foundItem.finder.user.lastname}
                                                    </Typography>
                                                    <Typography level="body2" color="neutral">
                                                        <strong>Email Address:</strong> {foundItem.finder.user.emailAddress}
                                                    </Typography>
                                                    <Typography level="body2" color="neutral">
                                                        <strong>Contact Number:</strong> {foundItem.finder.user.contactNumber}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Divider />

                                            <Typography level="body2" color="neutral">
                                                <strong>Description:</strong> {foundItem.finder.item.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography level="body2" color="neutral">
                                                        <strong>Color:</strong> {foundItem.finder.item.color}
                                                    </Typography>
                                                    <Typography level="body2" color="neutral">
                                                        <strong>Size:</strong> {foundItem.finder.item.size}
                                                    </Typography>
                                                    <Typography level="body2" color="neutral">
                                                        <strong>Category:</strong> {foundItem.finder.item.category}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography level="body2" color="neutral">
                                                        <strong>Material:</strong> {foundItem.finder.item.material}
                                                    </Typography>
                                                    <Typography level="body2" color="neutral">
                                                        <strong>Condition:</strong> {foundItem.finder.item.condition}
                                                    </Typography>
                                                    <Typography level="body2" color="neutral">
                                                        <strong>Distinctive Marks:</strong> {foundItem.finder.item.distinctiveMarks}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Divider />
                                            <Box>
                                                <Typography level="body2" color="neutral">
                                                    <strong>Found Location:</strong> {foundItem.finder.item.location}
                                                </Typography>
                                                <Typography level="body2" color="neutral">
                                                    <strong>Found Date:</strong> {foundItem.finder.item.date_time}
                                                </Typography>
                                            </Box>
                                        </Stack>
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
