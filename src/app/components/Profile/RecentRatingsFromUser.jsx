import React, { useState } from 'react';
import { Rating, Paper, Stack, Grid, Card, CardContent, Avatar, IconButton, LinearProgress, CircularProgress } from '@mui/material';
import { Box, Typography, Divider, Chip } from '@mui/joy';
import StarIcon from "@mui/icons-material/Star";
import { useTheme, useMediaQuery } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const RecentRatingsFromUser = ({ ratings, isLoading, error }) => {
    // State to track selected quantity rating
    const [selectedQuantity, setSelectedQuantity] = useState(null);
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

    if (isLoading) {
        return <CircularProgress />;
    }

    if (error) {
        return (
            <Typography variant="body1" color="error" sx={{ textAlign: 'center', mt: 2 }}>
                Failed to load ratings. Please try again later.
            </Typography>
        );
    }

    // Count the occurrences of each quantity rating
    const quantityCounts = ratings.reduce((acc, curr) => {
        if (curr.quantity) {
            acc[curr.quantity] = (acc[curr.quantity] || 0) + 1;
        }
        return acc;
    }, {});

    const countQuantities = [
        { quantity: 5, count: quantityCounts[5] || 0 },
        { quantity: 4, count: quantityCounts[4] || 0 },
        { quantity: 3, count: quantityCounts[3] || 0 },
        { quantity: 2, count: quantityCounts[2] || 0 },
        { quantity: 1, count: quantityCounts[1] || 0 },
    ];

    const totalQuantities = countQuantities.reduce((acc, curr) => acc + curr.count, 0);
    const totalQuantity = ratings.reduce((sum, rater) => sum + (rater.quantity || 0), 0); // Adjust to use 'quantity'
    const averageQuantity = totalQuantities > 0 ? (totalQuantity / totalQuantities).toFixed(1) : 0; // Avoid NaN

    // Compliments count logic
    const complimentCounts = ratings.reduce((acc, curr) => {
        curr.compliments?.forEach(compliment => {
            acc[compliment] = (acc[compliment] || 0) + 1;
        });
        return acc;
    }, {});

    // Filter ratings based on selected quantity
    const filteredRatings = selectedQuantity
        ? ratings.filter(rater => rater.quantity === selectedQuantity)
        : ratings;

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                Ratings from Other Users
            </Typography>
            <Paper elevation={3} sx={{ padding: "1rem", borderRadius: 2 }}>
                <Grid container spacing={3}>
                    {/* Average Quantity and Compliments Section */}
                    <Grid item xs={12} md={5}>
                        <Stack spacing={2} sx={{ alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', width: '100%' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography level="h2" sx={{ fontWeight: 'bold', color: '#333' }}>{averageQuantity}</Typography>
                                    <Rating
                                        size="small"
                                        name="rating"
                                        precision={0.5}
                                        value={averageQuantity}
                                        readOnly
                                        icon={<StarIcon fontSize="inherit" sx={{ color: '#FFD700' }} />}
                                        emptyIcon={<StarIcon fontSize="inherit" sx={{ color: '#ddd' }} />}
                                    />
                                    <Typography variant="body2" sx={{ color: '#666' }}>{totalQuantities} rating(s)</Typography>
                                </Box>

                                <Divider orientation="vertical" sx={{ mx: 2 }} />

                                <Box sx={{ flexGrow: 1, mt: 2 }}>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {Object.entries(complimentCounts).map(([compliment, count], index) => (
                                            <Chip
                                                size={isXs ? 'sm' : 'md'}
                                                key={`${compliment}-${index}`} // Generate a unique key for each compliment
                                                variant="outlined"
                                                sx={{
                                                    bgcolor: '#f5f5f5',
                                                    color: '#333',
                                                    border: '1px solid #ddd',
                                                    '&:hover': { bgcolor: '#e0e0e0' },
                                                }}
                                            >
                                                {`${compliment} (${count})`}
                                            </Chip>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ width: '100%', mt: 2, mb: 1 }} />

                            {/* Quantities Summary */}
                            {countQuantities.map(({ quantity, count }) => (
                                <Box
                                    key={quantity} // Add unique key here
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        mt: 1,
                                        cursor: 'pointer',
                                        transition: 'background 0.3s',
                                        '&:hover': { backgroundColor: '#f0f0f0' },
                                    }}
                                    onClick={() => setSelectedQuantity(selectedQuantity === quantity ? null : quantity)}
                                >
                                    <Typography sx={{ minWidth: 35, display: 'inline-flex', fontWeight: 'medium' }}>
                                        {quantity} <StarIcon sx={{ color: '#FFD700' }} />
                                    </Typography>
                                    <Box sx={{ flexGrow: 1, mx: 2 }}>
                                        <LinearProgress variant="determinate" value={totalQuantities > 0 ? (count / totalQuantities) * 100 : 0} />
                                    </Box>
                                    <Typography fontWeight="medium">{count}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Individual Ratings Section */}
                    <Grid item xs={12} md={7}>
                        <Stack spacing={2}>
                            <Box sx={{ height: "22rem", overflowY: 'auto', pr: 1 }}>
                                {filteredRatings.length === 0 ? (
                                    <Typography level="body1" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        No ratings available.
                                    </Typography>
                                ) : (
                                    filteredRatings.map((rater) => (
                                        <Card
                                            key={rater._id} // Use _id as the unique key
                                            elevation={2}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                mb: 1,
                                                transition: 'transform 0.2s',
                                                '&:hover': { transform: 'scale(1.02)' }, // Subtle hover effect
                                            }}
                                        >
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                    <Avatar
                                                        alt={`${rater.sender.firstname} ${rater.sender.lastname}'s Profile Picture`}
                                                        src={rater.sender.profile_picture}
                                                        sx={{
                                                            width: { xs: 40, sm: 92 },
                                                            height: { xs: 40, sm: 92 },
                                                            borderRadius: '50%',
                                                            boxShadow: 2,
                                                        }}
                                                    />
                                                    <Box>
                                                        <Typography level="subtitle1" fontWeight="bold">
                                                            {rater.sender?.firstname} {rater.sender?.lastname}
                                                        </Typography>

                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Rating
                                                                size="small"
                                                                name="rating"
                                                                precision={0.5}
                                                                value={rater.quantity}
                                                                readOnly
                                                                icon={<StarIcon fontSize="inherit" sx={{ color: '#FFD700' }} />}
                                                                emptyIcon={<StarIcon fontSize="inherit" sx={{ color: '#ddd' }} />}
                                                            />
                                                            <Typography level={isXs ? 'body-xs' : 'body-sm'}>
                                                                Review as{' '}
                                                                {rater.item.isFoundItem ? (
                                                                    <strong style={{ color: '#4CAF50' }}>a Finder</strong>
                                                                ) : (
                                                                    <strong style={{ color: '#F44336' }}>an Owner</strong>
                                                                )}
                                                            </Typography>
                                                            <Typography sx={{ display: { xs: 'none', md: 'block' } }} level="body-md">
                                                                {formatDistanceToNow(new Date(rater.date_created), { addSuffix: true })}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                                    {rater.compliments.map((compliment) => (
                                                        <Chip
                                                            size={isXs ? 'sm' : 'md'}
                                                            key={compliment}
                                                            variant="outlined"
                                                            sx={{
                                                                bgcolor: '#f5f5f5',
                                                                color: '#333',
                                                                border: '1px solid #ddd',
                                                                '&:hover': {
                                                                    bgcolor: '#e0e0e0',
                                                                },
                                                            }}
                                                        >
                                                            {compliment}
                                                        </Chip>
                                                    ))}
                                                </Box>

                                                <Typography level={isXs ? 'body-sm' : 'body-md'} color="text.secondary" sx={{ my: 3 }}>
                                                    {rater.feedback}
                                                </Typography>

                                                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'flex-start' }}>
                                                    <Avatar
                                                        alt={rater.item.name || "Item Image"}
                                                        src={rater.item.images[0]}
                                                        sx={{ width: 100, height: 100, borderRadius: '12%', boxShadow: 2 }}
                                                    />
                                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Typography level={isXs ? 'body-sm' : 'body-xs'} fontWeight="700">{rater.item.name}</Typography>
                                                        <Chip size={isXs ? 'sm' : 'md'} variant="solid" color="success">{rater.item.status}</Chip>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default RecentRatingsFromUser;

