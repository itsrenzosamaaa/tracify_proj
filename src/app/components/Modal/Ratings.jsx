import React, { useCallback, useEffect, useState } from 'react';
import { Rating, Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Modal, ModalDialog, ModalClose, Button, Typography, FormLabel, Chip, FormControl, Textarea, Stack } from '@mui/joy';

const finderComplimentsList = [
    'Trustworthy', 'Helpful', 'Friendly', 'Responsive', 'Efficient',
    'Resourceful', 'Considerate', 'Patient', 'Compassionate'
];

const ownerComplimentsList = [
    'Grateful', 'Punctual', 'Understanding', 'Trustworthy', 'Appreciative',
    'Courteous', 'Organized', 'Respectful', 'Reliable'
];

const RatingsModal = ({ open, onClose, item, session, status }) => {
    const [rating, setRating] = useState(null);
    const [stars, setStars] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [selectedCompliments, setSelectedCompliments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRating = useCallback(async () => {
        if (!session?.user?.id) return;

        try {
            const response = await fetch(`/api/ratings/${item._id}/sender/${session.user.id}`);
            const data = await response.json();
            setRating(data);
            if (data.done_review) {
                setStars(data.quantity);
                setFeedback(data.feedback);
                setSelectedCompliments(data.compliments);
            }
        } catch (error) {
            console.error("Error fetching rating:", error);
        }
    }, [session?.user?.id, item?._id]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchRating();
        }
    }, [status, fetchRating]);

    const complimentsList = item?.finder ? ownerComplimentsList : finderComplimentsList;

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
            const response = await fetch(`/api/ratings/${item._id}/sender/${session.user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: ratingData }),
            });

            if (response.ok) {
                console.log('Rating submitted successfully');
                resetForm();
                onClose();
            } else {
                const errorData = await response.json();
                console.error('Failed to submit rating:', errorData.message);
            }
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

    const handleClose = () => {
        resetForm(); // Reset the form before closing
        onClose(); // Call the onClose prop
    };

    return (
        <Modal open={open === item._id} onClose={handleClose}>
            <ModalDialog>
                <ModalClose />
                {rating?.done_review ? (
                    <Stack spacing={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 2 }}>
                        <Typography level="h4" component="h2" fontWeight="bold" gutterBottom>
                            Review for {rating?.isFoundItem ? 'Owner' : 'Finder'}
                        </Typography>

                        <Box sx={{ bgcolor: 'grey.100', borderRadius: 1, p: 2 }}>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                <strong>Item:</strong> {item.name}
                            </Typography>

                            <Typography variant="body1" color="text.secondary">
                                <strong>{rating?.isFoundItem ? 'Owner' : 'Finder'}:</strong> {`${rating?.receiver?.firstname} ${rating?.receiver?.lastname}`}
                            </Typography>
                        </Box>

                        <FormControl>
                            <FormLabel sx={{ fontWeight: 'medium', color: 'text.primary' }}>Your Rating</FormLabel>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
                                <Rating
                                    name="rating"
                                    value={rating.quantity}
                                    readOnly
                                    icon={<StarIcon fontSize="inherit" />}
                                    emptyIcon={<StarIcon fontSize="inherit" />}
                                />
                                <Typography sx={{ ml: 1 }} color="text.secondary">
                                    {rating.quantity}/5
                                </Typography>
                            </Box>
                        </FormControl>

                        <FormControl>
                            <FormLabel sx={{ fontWeight: 'medium', color: 'text.primary' }}>Feedback</FormLabel>
                            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {rating.feedback}
                                </Typography>
                            </Box>
                        </FormControl>

                        {rating.compliments?.length > 0 && (
                            <FormControl>
                                <FormLabel sx={{ fontWeight: 'medium', color: 'text.primary' }}>Compliments</FormLabel>
                                <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                                    {rating.compliments.map((compliment) => (
                                        <Chip key={compliment} color="primary" variant="outlined" sx={{ fontWeight: 'medium' }}>{compliment}</Chip>
                                    ))}
                                </Box>
                            </FormControl>
                        )}
                    </Stack>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <Typography level="h4" gutterBottom>
                                Rate {item?.finder ? 'Owner' : 'Finder'}
                            </Typography>

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

                            <FormControl required>
                                <FormLabel>Feedback</FormLabel>
                                <Textarea
                                    type="text"
                                    name="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Write your feedback here..."
                                    minRows={4}
                                />
                            </FormControl>

                            {stars >= 4 && (
                                <FormControl>
                                    <FormLabel>Compliments</FormLabel>
                                    <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                                        {complimentsList.map((compliment) => {
                                            const checked = selectedCompliments.includes(compliment);
                                            return (
                                                <Chip
                                                    key={compliment}
                                                    variant="outlined"
                                                    color={checked ? 'primary' : 'neutral'}
                                                    onClick={() => handleComplimentChange(compliment)}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    {compliment}
                                                </Chip>
                                            );
                                        })}
                                    </Box>
                                </FormControl>
                            )}

                            <Button fullWidth sx={{ mt: 3 }} type="submit" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Rating'}
                            </Button>
                        </Stack>
                    </form>
                )}
            </ModalDialog>
        </Modal>
    );
};

export default RatingsModal;
