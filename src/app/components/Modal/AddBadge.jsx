import React, { useState } from 'react';
import { Snackbar, Checkbox, Modal, ModalDialog, ModalClose, DialogContent, Typography, Stack, FormControl, FormLabel, Input, Textarea, Button, Box, Select, Option, Grid } from '@mui/joy';
import PreviewBadge from '../PreviewBadge';

const AddBadgeModal = ({ open, onClose, refreshData }) => {
    const [title, setTitle] = useState('Treasure Hunter');
    const [titleShimmer, setTitleShimmer] = useState(false);
    const [shape, setShape] = useState('circle');
    const [shapeColor, setShapeColor] = useState('#FFD700');
    const [bgShape, setBgShape] = useState('circle');
    const [bgColor, setBgColor] = useState('#FFEB3B');
    const [bgOutline, setBgOutline] = useState('#000000');
    const [condition, setCondition] = useState();
    const [meetConditions, setMeetConditions] = useState();
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (meetConditions <= 0) {
            alert('The meet conditions should not lower than 0.')
            setLoading(false);
            return;
        }

        const badgeFormData = {
            title,
            titleShimmer,
            shape,
            shapeColor,
            bgShape,
            bgColor,
            bgOutline,
            condition,
            meetConditions,
        }

        try {
            const response = await fetch('/api/badge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(badgeFormData),
            });

            if (response.ok) {
                handleClose();
                setOpenSnackbar(true);
                await refreshData();
            } else {
                const data = await response.json();
                alert(`Failed to add badge: ${data.error}`);
            }
        } catch (error) {
            console.error('Error adding badge:', error);
            alert('An error occurred while adding the badge.');
        } finally {
            setLoading(false)
        }
    };

    const handleClose = () => {
        onClose();
        setTitle('Treasure Hunter');
        setTitleShimmer(false);
        setShape('circle');
        setShapeColor('#FFD700');
        setBgShape('circle');
        setBgColor('#FFEB3B');
        setBgOutline('#000000');
        setCondition();
        setMeetConditions();
    }

    return (
        <>
            <Modal open={open} onClose={handleClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4" gutterBottom sx={{ mb: 3 }}>Add Badge</Typography>
                    <DialogContent
                        sx={{
                            overflowX: 'hidden',
                            overflowY: 'auto', // Allows vertical scrolling
                            '&::-webkit-scrollbar': { display: 'none' }, // Hides scrollbar in WebKit-based browsers (Chrome, Edge, Safari)
                            '-ms-overflow-style': 'none', // Hides scrollbar in IE and Edge
                            'scrollbar-width': 'none', // Hides scrollbar in Firefox
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                {/* Badge Title */}
                                <Grid item xs={12} md={12}>
                                    <FormControl fullWidth>
                                        <FormLabel>Badge Title</FormLabel>
                                        <Input
                                            name="name"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </FormControl>
                                </Grid>

                                {/* Shape and Shape Color */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <FormLabel>Shape</FormLabel>
                                        <Select
                                            value={shape}
                                            onChange={(e, value) => setShape(value)}
                                        >
                                            <Option value="circle">Circle</Option>
                                            <Option value="square">Square</Option>
                                            <Option value="star">Star</Option>
                                            <Option value="triangle">Triangle</Option>
                                            <Option value="hexagon">Hexagon</Option>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <FormLabel>Shape Color</FormLabel>
                                        <Input
                                            type="color"
                                            value={shapeColor}
                                            onChange={(e) => setShapeColor(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>

                                {/* Background Shape, Color, and Outline */}
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <FormLabel>BG Shape</FormLabel>
                                        <Select
                                            value={bgShape}
                                            onChange={(e, value) => setBgShape(value)}
                                        >
                                            <Option value="circle">Circle</Option>
                                            <Option value="square">Square</Option>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <FormControl fullWidth>
                                        <FormLabel>BG Color</FormLabel>
                                        <Input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <FormControl fullWidth>
                                        <FormLabel>BG Outline Color</FormLabel>
                                        <Input
                                            type="color"
                                            value={bgOutline}
                                            onChange={(e) => setBgOutline(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>

                                {/* Condition and Meet Conditions */}
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <FormLabel>Condition</FormLabel>
                                        <Select
                                            value={condition}
                                            onChange={(e, value) => setCondition(value)}
                                        >
                                            <Option value="Found Item/s">No. of Found Items</Option>
                                            <Option value="Rating/s">No. of Ratings</Option>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <FormLabel>Meet Conditions</FormLabel>
                                        <Input
                                            fullWidth
                                            type="number"
                                            value={meetConditions}
                                            onChange={(e) => {
                                                // Allow only numeric values
                                                const value = e.target.value.replace(/\D/g, ""); // Remove all non-numeric characters
                                                setMeetConditions(value);
                                            }}
                                            onKeyDown={(e) => {
                                                // Prevent invalid key presses
                                                if (
                                                    ["e", "E", ".", "-", "+"].includes(e.key) || // Disallow specific characters
                                                    (!/^\d$/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") // Allow only digits, Backspace, Delete, and arrow keys
                                                ) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </Grid>

                                {/* Shimmer Effect */}
                                <Grid item xs={12}>
                                    <FormControl>
                                        <Checkbox
                                            label="Add a shimmering effect?"
                                            checked={titleShimmer}
                                            onChange={(e) => setTitleShimmer(e.target.checked)}
                                        />
                                    </FormControl>
                                </Grid>

                                {/* Submit Button */}
                                <Grid item xs={12}>
                                    <Button
                                        loading={loading}
                                        disabled={loading}
                                        type="submit"
                                        fullWidth
                                    >
                                        Update Badge
                                    </Button>
                                </Grid>

                                {/* Preview Section */}
                                <Grid item xs={12}>
                                    <Typography level="h4" textAlign="center" gutterBottom>
                                        Preview
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '150px',
                                                height: '150px',
                                                border: '1px solid #ddd',
                                                borderRadius: '10px',
                                                padding: '10px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <PreviewBadge
                                                title={title}
                                                titleShimmer={titleShimmer}
                                                shape={shape}
                                                shapeColor={shapeColor}
                                                bgShape={bgShape}
                                                bgColor={bgColor}
                                                bgOutline={bgOutline}
                                                condition={condition}
                                                meetConditions={meetConditions}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
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
                Badge has been successfully created!
            </Snackbar>
        </>
    );
};

export default AddBadgeModal;