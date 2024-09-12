import React, { useState } from 'react';
import { Paper, Stack, Grid, Card, CardContent, Avatar, LinearProgress } from '@mui/material';
import { Box, Typography, Divider } from '@mui/joy';
import StarIcon from "@mui/icons-material/Star";

const raters = [
    { rateID: 'RT-0001', userID: 'C-2021-0002', stars: 5, feedback: 'Great service!', dateRating: '09/21/2024' },
    { rateID: 'RT-0002', userID: 'C-2021-0003', stars: 4, feedback: 'Good experience.', dateRating: '09/20/2024' },
    { rateID: 'RT-0003', userID: 'C-2021-0004', stars: 3, feedback: 'Satisfactory.', dateRating: '09/19/2024' },
    { rateID: 'RT-0004', userID: 'C-2021-0005', stars: 5, feedback: 'Amazing!', dateRating: '09/18/2024' },
    { rateID: 'RT-0005', userID: 'C-2021-0006', stars: 2, feedback: 'Could be better.', dateRating: '09/17/2024' },
];

const RecentRatingsFromUser = () => {
    const [selectedRating, setSelectedRating] = useState(null); // State to track selected star rating

    const starCounts = raters.reduce((acc, curr) => {
        acc[curr.stars] = (acc[curr.stars] || 0) + 1;
        return acc;
    }, {});

    const ratings = [
        { rating: 5, count: starCounts[5] || 0 },
        { rating: 4, count: starCounts[4] || 0 },
        { rating: 3, count: starCounts[3] || 0 },
        { rating: 2, count: starCounts[2] || 0 },
        { rating: 1, count: starCounts[1] || 0 },
    ];

    const totalRatings = ratings.reduce((acc, curr) => acc + curr.count, 0);

    const totalStars = raters.reduce((sum, rater) => sum + rater.stars, 0);
    const averageRating = totalStars / raters.length;

    // Filter raters based on selected rating, or show all if none is selected
    const filteredRaters = selectedRating
        ? raters.filter(rater => rater.stars === selectedRating)
        : raters;

    const renderRatingRow = (rating, count) => (
        <Box
            sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 1, cursor: 'pointer' }}
            onClick={() => setSelectedRating(selectedRating === rating ? null : rating)} // Toggle selection
        >
            <Typography sx={{ minWidth: 35, display: 'inline-flex' }}>{rating} <StarIcon sx={{ color: '#FFD700' }} /></Typography>
            <Box sx={{ flexGrow: 1, mx: 2 }}>
                <LinearProgress variant="determinate" value={totalRatings > 0 ? (count / totalRatings) * 100 : 0} />
            </Box>
            <Typography>{count}</Typography>
        </Box>
    );

    return (
        <Paper elevation={2} sx={{ border: '1px solid #D9D9D9' }}>
            <Box sx={{ padding: "1rem" }}>
                <Divider>
                    <Typography level="body-lg" fontWeight="500">
                        Recent Ratings From Users
                    </Typography>
                </Divider>

                <Grid container spacing={2} sx={{ my: 2 }}>
                    <Grid item xs={12} lg={6}>
                        <Stack sx={{ width: '100%' }} spacing={1}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 'auto',
                                    mt: 3,
                                }}
                            >
                                <StarIcon
                                    sx={{
                                        color: '#FFD700',  // Gold color for star
                                        fontSize: '9rem',  // Adjust the size of the star
                                    }}
                                />
                                <Typography
                                    level="h5"
                                    component="span"
                                    sx={{
                                        position: 'absolute',
                                        color: '#fff',  // White text color
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {averageRating.toFixed(1)}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', marginTop: '-5rem' }}>
                                <Typography>
                                    Average Rating
                                </Typography>
                                <Typography>
                                    Based on {raters.length} ratings.
                                </Typography>
                            </Box>
                            {ratings.map((item) => renderRatingRow(item.rating, item.count))}
                        </Stack>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <Stack spacing={2}>
                            <Box sx={{ height: "24rem", overflowY: 'auto' }}>
                                {filteredRaters === null || filteredRaters.length === 0 ? (
                                    <Typography level="h2" sx={{ height: '22rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        No results.
                                    </Typography>
                                ) : (
                                    filteredRaters.map((rater) => (
                                        <Card key={rater.rateID} elevation={3} sx={{ my: 1, display: 'flex', alignItems: 'center', padding: 2 }}>
                                            <Avatar sx={{ bgcolor: '#FFD700', mr: 2 }}>
                                                <StarIcon sx={{ color: '#fff' }} />
                                            </Avatar>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography level="body1" fontWeight="bold">
                                                    {rater.userID}
                                                </Typography>
                                                <Typography level="body2" color="textSecondary">
                                                    {rater.feedback}
                                                </Typography>
                                                <Typography level="body2" color="textSecondary">
                                                    Rated {rater.stars} stars on {rater.dateRating}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default RecentRatingsFromUser;
