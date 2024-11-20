import React, { useState } from 'react';
import { Snackbar, Checkbox, Modal, ModalDialog, ModalClose, DialogContent, Typography, Stack, FormControl, FormLabel, Input, Textarea, Button, Box, Select, Option, Grid } from '@mui/joy';
import PreviewBadge from '../PreviewBadge';

const AddBadgeModal = ({ open, onClose, refreshData }) => {
    const [title, setTitle] = useState('Example Title');
    const [titleColor, setTitleColor] = useState('#000000');
    const [titleShimmer, setTitleShimmer] = useState(false);
    const [titleOutlineColor, setTitleOutlineColor] = useState('#FFFFFF');
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
            titleColor,
            titleShimmer,
            titleOutlineColor,
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
        setTitle('Example Title');
        setTitleColor('#000000');
        setTitleShimmer(false);
        setTitleOutlineColor('#FFFFFF');
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
                <ModalDialog sx={{ display: 'flex', flexDirection: 'row' }}>
                    <ModalClose />
                    <DialogContent sx={{ width: '800px' }}>
                        <Box sx={{ flex: 1, paddingRight: '20px', display: 'flex', flexDirection: 'column' }}>
                            <Typography level="h4" gutterBottom sx={{ mb: 3 }}>Add Badge</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} lg={9}>
                                    <form onSubmit={handleSubmit}>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Box sx={{ width: '100%' }}>
                                                    <FormControl fullWidth>
                                                        <FormLabel>Badge Title</FormLabel>
                                                        <Input
                                                            name="name"
                                                            value={title}
                                                            onChange={(e) => setTitle(e.target.value)}
                                                            required
                                                        />
                                                    </FormControl>
                                                </Box>

                                                <Box sx={{ width: '100%' }}>
                                                    <FormLabel>Title Color</FormLabel>
                                                    <Input
                                                        fullWidth
                                                        type="color"
                                                        value={titleColor}
                                                        onChange={(e) => setTitleColor(e.target.value)}
                                                    />
                                                </Box>

                                                <Box sx={{ width: '100%' }}>
                                                    <FormLabel>Title Outline Color</FormLabel>
                                                    <Input
                                                        fullWidth
                                                        type="color"
                                                        value={titleOutlineColor}
                                                        onChange={(e) => setTitleOutlineColor(e.target.value)}
                                                    />
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Box sx={{ width: '100%' }}>
                                                    <FormLabel>Shape</FormLabel>
                                                    <Select
                                                        value={shape}
                                                        onChange={(e, value) => setShape(value)}
                                                        fullWidth
                                                    >
                                                        <Option value="circle">Circle</Option>
                                                        <Option value="square">Square</Option>
                                                        <Option value="star">Star</Option>
                                                        <Option value="triangle">Triangle</Option>
                                                        <Option value="hexagon">Hexagon</Option>
                                                    </Select>
                                                </Box>

                                                <Box sx={{ width: '100%' }}>
                                                    <FormLabel>Shape Color</FormLabel>
                                                    <Input
                                                        fullWidth
                                                        type="color"
                                                        value={shapeColor}
                                                        onChange={(e) => setShapeColor(e.target.value)}
                                                    />
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Box sx={{ width: '100%' }}>
                                                    <FormLabel>Background Shape</FormLabel>
                                                    <Select
                                                        value={bgShape}
                                                        onChange={(e, value) => setBgShape(value)}
                                                        fullWidth
                                                    >
                                                        <Option value="circle">Circle</Option>
                                                        <Option value="square">Square</Option>
                                                    </Select>
                                                </Box>

                                                <Box sx={{ width: '100%' }}>
                                                    <FormLabel>Background Color</FormLabel>
                                                    <Input
                                                        fullWidth
                                                        type="color"
                                                        value={bgColor}
                                                        onChange={(e) => setBgColor(e.target.value)}
                                                    />
                                                </Box>

                                                <Box sx={{ width: '100%' }}>
                                                    <FormLabel>Background Outline Color</FormLabel>
                                                    <Input
                                                        fullWidth
                                                        type="color"
                                                        value={bgOutline}
                                                        onChange={(e) => setBgOutline(e.target.value)}
                                                    />
                                                </Box>
                                            </Box>

                                            <FormControl>
                                                <FormLabel>Condition</FormLabel>
                                                <Select
                                                    value={condition}
                                                    onChange={(e, value) => setCondition(value)}
                                                    fullWidth
                                                >
                                                    <Option value="Found Item/s">No. of Found Items</Option>
                                                    <Option value="Rating/s">No. of Ratings</Option>
                                                </Select>
                                            </FormControl>

                                            {
                                                condition &&
                                                <FormControl>
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
                                            }

                                            <FormControl>
                                                <Checkbox label="Add a shimmering effect?" checked={titleShimmer} onChange={(e) => setTitleShimmer(e.target.checked)} />
                                            </FormControl>

                                            <Button loading={loading} disabled={loading} type="submit" fullWidth>Add Badge</Button>
                                        </Stack>
                                    </form>
                                </Grid>
                                <Grid item xs={12} lg={3}>
                                    <Typography level="h4" textAlign="center" gutterBottom>Preview</Typography>
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px' }}>
                                        <Box sx={{ width: '150px', height: '150px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', borderRadius: '10px', padding: '10px', alignItems: 'center', justifyContent: 'center' }}>
                                            <PreviewBadge
                                                title={title}
                                                titleColor={titleColor}
                                                titleShimmer={titleShimmer}
                                                titleOutlineColor={titleOutlineColor}
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
                        </Box>
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
