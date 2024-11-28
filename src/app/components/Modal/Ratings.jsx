import React, { useCallback, useEffect, useState } from 'react';
import { Rating, Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useTheme, useMediaQuery } from '@mui/material';
import { Snackbar, Avatar, Modal, ModalDialog, ModalClose, Button, Typography, FormLabel, Chip, FormControl, Textarea, Stack, FormHelperText, DialogContent } from '@mui/joy';

const finderComplimentsList = [
    'Trustworthy', 'Fast', 'Generous', 'Honest', 'Reliable', 'Committed', 'Attentive', 'Knowledgeable', 'Reassurance'
];

const ownerComplimentsList = [
    'Trustworthy', 'Kind-hearted', 'Patient', 'Organized', 'Reliable', 'Flexible', 'Thoughtful', 'Self-aware', 'Empathetic'
];

const RatingsModal = ({ item, session, open, onClose, refreshData }) => {
    const [stars, setStars] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [selectedCompliments, setSelectedCompliments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

    const complimentsList = item?.item.isFoundItem ? ownerComplimentsList : finderComplimentsList;

    const handleComplimentChange = (compliment) => {
        setSelectedCompliments(prev =>
            prev.includes(compliment)
                ? prev.filter(c => c !== compliment)
                : [...prev, compliment]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Rating data structure
        const ratingData = {
            quantity: stars,
            feedback,
            compliments: selectedCompliments,
            done_review: true,
            date_created: new Date(),
        };

        if (!item?._id || !session?.user?.id) {
            console.error("Missing item ID or sender ID");
            setLoading(false);
            return;
        }

        try {
            // Helper function for API requests
            const makeRequest = async (url, method, body = null) => {
                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: body ? JSON.stringify(body) : null,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed request to ${url}`);
                }

                return response.json();
            };

            // Save rating
            await makeRequest(`/api/ratings/${item.item._id}/sender/${session.user.id}`, 'PUT', { rating: ratingData });

            // Fetch badges and sender data
            const [badgeData, senderData] = await Promise.all([
                makeRequest('/api/badge/ratings', 'GET'),
                makeRequest(`/api/ratings/sender/${session.user.id}`, 'GET'),
            ]);

            // Filter sender ratings
            const completedReviews = senderData.filter((sender) => sender.done_review).length;

            // Award badges if conditions are met
            await Promise.all(
                badgeData.map(async (badge) => {
                    if (completedReviews >= badge.meetConditions) {
                        await makeRequest(`/api/award-badge/user/${session.user.id}`, 'PUT', { badgeId: badge._id });
                    }
                })
            );

            await makeRequest('/api/notification', 'POST', {
                receiver: item?.receiver?._id,
                message: `${item?.sender?.firstname} (${item?.item?.isFoundItem ? 'Owner' : 'Finder'}) provided you a feedback! Check your profile to view your ratings.`,
                type: 'Profile',
                markAsRead: false,
                dateNotified: new Date(),
            });

            // Success actions
            onClose();
            refreshData();
            resetForm();
            setOpenSnackbar(true);
        } catch (error) {
            console.error("Error submitting rating:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStars(0);
        setFeedback('');
        setSelectedCompliments([]);
    };

    return (
        <>
            <Modal open={open === item._id} onClose={onClose} size="large">
                <ModalDialog
                    sx={{
                        width: '90%', // Set a percentage width for responsiveness
                        maxWidth: 600, // Set a maximum width
                        borderRadius: 3, // Adjust border radius
                    }}
                >
                    <ModalClose />
                    <Typography level="h4" fontWeight="bold" gutterBottom sx={{ color: 'text.primary' }}>
                        Review for {item?.item.isFoundItem ? 'Owner' : 'Finder'}
                    </Typography>
                    <DialogContent sx={{ overflowX: 'hidden' }}>
                        {item?.done_review ? (
                            // Review Section
                            <Stack spacing={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 2 }}>
                                {/* Item and Receiver Information */}
                                <Box sx={{ bgcolor: 'grey.100', borderRadius: 1, p: 3, boxShadow: 1 }}>
                                    <Typography variant="body1" color="text.secondary" gutterBottom>
                                        <strong>Item:</strong> {item.item.name}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>{item.item.isFoundItem ? 'Owner' : 'Finder'}:</strong> {`${item?.receiver?.firstname} ${item?.receiver?.lastname}`}
                                    </Typography>
                                </Box>

                                {/* Rating Section */}
                                <FormControl sx={{ mt: 2 }}>
                                    <FormLabel sx={{ fontWeight: 'medium', color: 'text.primary' }}>Your Rating</FormLabel>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
                                        <Rating
                                            name="rating"
                                            value={item.quantity}
                                            readOnly
                                            icon={<StarIcon fontSize="inherit" />}
                                            emptyIcon={<StarIcon fontSize="inherit" />}
                                        />
                                        <Typography sx={{ ml: 1 }} color="text.secondary">
                                            {item.quantity}/5
                                        </Typography>
                                    </Box>
                                </FormControl>

                                {/* Feedback Section */}
                                <FormControl sx={{ mt: 2 }}>
                                    <FormLabel sx={{ fontWeight: 'medium', color: 'text.primary' }}>Feedback</FormLabel>
                                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mt: 1, boxShadow: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.feedback}
                                        </Typography>
                                    </Box>
                                </FormControl>

                                {/* Compliments Section */}
                                {item.compliments?.length > 0 && (
                                    <FormControl sx={{ mt: 2 }}>
                                        <FormLabel sx={{ fontWeight: 'medium', color: 'text.primary' }}>Compliments</FormLabel>
                                        <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                                            {item.compliments.map((compliment) => (
                                                <Chip
                                                    key={compliment}
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 'medium', boxShadow: 1, borderRadius: '12px' }}
                                                >
                                                    {compliment}
                                                </Chip>
                                            ))}
                                        </Box>
                                    </FormControl>
                                )}
                            </Stack>
                        ) : (
                            // Feedback Form Section
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2}>
                                    {/* Receiver Info */}
                                    <FormControl>
                                        <FormLabel>Receiver</FormLabel>
                                        <Typography level={isXs ? 'body-sm' : 'body-md'} fontWeight="bold">
                                            {`${item?.receiver?.firstname} ${item?.receiver?.lastname}`}
                                        </Typography>
                                    </FormControl>

                                    {/* Item Image and Info */}
                                    <FormControl>
                                        <FormLabel>Item Image</FormLabel>
                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                            <Avatar
                                                alt={item.item.name || "Item Image"}
                                                src={item.item.images[0]}
                                                sx={{ width: 100, height: 100, borderRadius: '12%', boxShadow: 2 }}
                                            />
                                            <Box>
                                                <Typography level={isXs ? 'body-md' : 'body-lg'} fontWeight="700">{item.item.name}</Typography>
                                                <Chip size={isXs ? 'sm' : 'md'} color="success" variant="solid">{item.item.status}</Chip>
                                            </Box>
                                        </Box>
                                    </FormControl>

                                    {/* Rating Form */}
                                    <FormControl required>
                                        <FormLabel>Your Rating</FormLabel>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Rating
                                                name="rating"
                                                value={stars}
                                                onChange={(event, newValue) => setStars(newValue)}
                                                icon={<StarIcon fontSize="inherit" />}
                                                emptyIcon={<StarIcon fontSize="inherit" />}
                                            />
                                        </Box>
                                    </FormControl>

                                    {/* Compliments (Only if rating is high enough) */}
                                    {stars >= 4 && (
                                        <FormControl>
                                            <FormLabel>Compliments</FormLabel>
                                            <FormHelperText>
                                                {item?.item.isFoundItem ? "Is your owner reliable? Don't forget to leave a compliment/s" : 'Satisfied with your item? Compliment a finder!'}
                                            </FormHelperText>
                                            <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                                                {complimentsList.map((compliment) => (
                                                    <Chip
                                                        variant="outlined"
                                                        key={compliment}
                                                        color={selectedCompliments.includes(compliment) ? 'primary' : 'default'}
                                                        onClick={() => handleComplimentChange(compliment)}
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        {compliment}
                                                    </Chip>
                                                ))}
                                            </Box>
                                        </FormControl>
                                    )}

                                    {/* Feedback Input */}
                                    <FormControl required>
                                        <FormLabel>Feedback</FormLabel>
                                        <Textarea
                                            value={feedback}
                                            minRows="4"
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder="Share your experience"
                                        />
                                    </FormControl>

                                    {/* Submit Button */}
                                    <Button type="submit" loading={loading} fullWidth color="success">
                                        Submit Review
                                    </Button>
                                </Stack>
                            </form>
                        )}
                    </DialogContent>
                </ModalDialog>
            </Modal>
            <Snackbar
                autoHideDuration={5000}
                open={openSnackbar}
                variant="solid"
                color="success"
                onClose={(event, reason) => {
                    if (reason === 'clickaway') {
                        return;
                    }
                    setOpenSnackbar(false);
                }}
            >
                Rated successfully!
            </Snackbar>
        </>
    );
};

export default RatingsModal;
