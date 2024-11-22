'use client';

import Loading from '@/app/components/Loading';
import { Box, Typography, Card, Divider, Stack, Button, Grid, Chip, Stepper, Step, Avatar, StepIndicator } from '@mui/joy';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { isToday, format } from 'date-fns';
import CancelRetrievalRequest from '@/app/components/Modal/CancelRetrievalRequest';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { CldImage } from 'next-cloudinary';
import ViewRetrievalHistory from '@/app/components/Modal/ViewRetrievalHistory';
import { FindInPage } from '@mui/icons-material';
import { useMediaQuery, useTheme } from '@mui/material';

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
    const [itemRetrievalHistory, setItemRetrievalHistory] = useState([]);
    const [openHistoryModal, setOpenHistoryModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelModal, setCancelModal] = useState(false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
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
            const findUncompletedItems = data.filter(uncompletedItem => uncompletedItem.owner.item._id === lostItemId && (uncompletedItem.request_status === "Canceled" || uncompletedItem.request_status === "Declined"))
            setFoundItem(findFoundItem);
            setItemRetrievalHistory(findUncompletedItems);
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
                    await Promise.all([fetchLostItem(), fetchFoundItem(lostId)]);
                } catch (error) {
                    console.error(error);
                    setError('Failed to load data. Please try again later.');
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
                    <Grid item xs={12}>
                        {
                            lostItem.status === 'Unclaimed' &&
                            <Grid container spacing={2}>
                                {/* Full-width Card containing details and the stepper */}
                                <Grid item xs={12}>
                                    <Card variant="outlined" sx={{ p: 3, boxShadow: 2, maxWidth: '100%', mx: 'auto', overflow: 'hidden' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography
                                                level="h2"
                                                sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}
                                            >
                                                Surrender Instructions
                                            </Typography>
                                            <Button onClick={() => router.push('/my-items')} color="danger" aria-label="Back to my items">
                                                Back
                                            </Button>
                                        </Box>
                                        <Divider sx={{ mb: 3, borderColor: 'primary.main' }} />

                                        <Grid container spacing={2} alignItems="flex-start">
                                            {/* Left Side: Surrender Details */}
                                            <Grid item xs={12} md={4}>
                                                <Box>
                                                    {/* Introduction */}
                                                    <Typography level="body2" color="danger" textAlign="justify" sx={{ my: 2, fontWeight: 'bold' }}>
                                                        <strong>Reminder:</strong> Falsely claiming an item that does not belong to you is a serious offense and may result in consequences such as suspension. If the item does not belong to you, you may cancel the retrieval process.
                                                    </Typography>
                                                    <Button color="danger" fullWidth>Cancel Retrieval Process</Button>
                                                </Box>
                                            </Grid>

                                            {/* Vertical Divider */}
                                            <Divider
                                                orientation="vertical"
                                                flexItem
                                                sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }}
                                            />

                                            {/* Right Side: Stepper */}
                                            <Grid item xs={12} md={7}>
                                                <Stepper
                                                    size="md"
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
                                                                marginLeft: { xs: '1rem', md: '' },
                                                            }}
                                                        >
                                                            <Typography level="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                                Visit the Office
                                                            </Typography>
                                                            <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                                                                Go to the <strong>{foundItem.finder.item.monitoredBy.role.name}</strong> office at <strong>{foundItem.finder.item.monitoredBy.office_location}</strong>. Make sure to bring any required documents or proof of ownership.
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
                                                                marginLeft: { xs: '1rem', md: '' },
                                                            }}
                                                        >
                                                            <Typography level="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                                Verify Ownership
                                                            </Typography>
                                                            <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                                                                Present your proof of ownership or identification to the person-in-charge. Answer any questions to confirm you are the rightful owner.
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
                                                                marginLeft: { xs: '1rem', md: '' },
                                                            }}
                                                        >
                                                            <Typography level="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                                Claim the Item
                                                            </Typography>
                                                            <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                                                                Once your claim is verified, the item will be handed to you. Sign any required documents to finalize the process.
                                                            </Typography>
                                                        </Box>
                                                    </Step>
                                                </Stepper>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                </Grid>
                            </Grid>
                        }
                    </Grid>
                    {/* Lost Item Details */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography level="h2">{lostItem.name}</Typography>
                                </Box>

                                <Typography level="body2" color="neutral">
                                    <strong>Status:</strong> <Chip variant="solid" color="danger">{lostItem.status}</Chip>
                                </Typography>

                                <Carousel showThumbs={false} useKeyboardArrows>
                                    {
                                        lostItem?.images?.map((image, index) => (
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
                                                    alt={lostItem?.name || 'Item Image'}
                                                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                                />
                                            </Box>
                                        ))
                                    }
                                </Carousel>

                                <Divider />

                                <Button onClick={() => setOpenHistoryModal(true)}>View Retrieval History</Button>
                                <ViewRetrievalHistory open={openHistoryModal} onClose={() => setOpenHistoryModal(false)} retrievalItems={itemRetrievalHistory} />

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
                                    {/* Found Item Details */}
                                    <Box>
                                        <Stack spacing={2}>
                                            <Typography level="h2" sx={{ color: 'success.main', fontWeight: 'bold' }}>{lostItem.status === 'Missing' ? 'Potential Matched Item' : 'Your Item Has Been Found!'}</Typography>
                                            <Carousel showThumbs={false} useKeyboardArrows>
                                                {
                                                    foundItem?.finder.item.images?.map((image, index) => (
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
                                                                alt={foundItem?.finder?.item?.name || 'Item Image'}
                                                                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                                            />
                                                        </Box>
                                                    ))
                                                }
                                            </Carousel>

                                            {
                                                foundItem.request_status === 'Pending' &&
                                                <>
                                                    <Button fullWidth color='danger' onClick={() => setCancelModal(true)}>Cancel Retrieval Request</Button>
                                                    <CancelRetrievalRequest open={cancelModal} onClose={() => setCancelModal(false)} matchItem={foundItem} />
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