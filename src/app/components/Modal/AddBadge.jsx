import React, { useState } from 'react';
import { Tooltip, Modal, ModalDialog, ModalClose, DialogContent, Typography, Stack, FormControl, FormLabel, Input, Textarea, Button, Box, Select, Option, Grid } from '@mui/joy';

const AddBadgeModal = ({ open, onClose }) => {
    const [title, setTitle] = useState('Example Title');
    const [description, setDescription] = useState('Touch the badge and you will know the details about this badge!');
    const [shape, setShape] = useState('circle');
    const [shapeColor, setShapeColor] = useState('#FFD700');
    const [shapeOutline, setShapeOutline] = useState('#000');
    const [bgShape, setBgShape] = useState('circle');
    const [bgColor, setBgColor] = useState('#FFEB3B');
    const [bgOutline, setBgOutline] = useState('#000');
    const [condition, setCondition] = useState();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Badge Details:', { title, description, shape, shapeColor, shapeOutline, bgShape, bgColor, bgOutline });
    };

    // Function to create a star shape with CSS
    const createStarShape = (size, color, outline) => {
        return {
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            border: `5px solid ${outline}`,
            boxSizing: 'border-box',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        };
    };


    const badgePreviewStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100px',
        height: '100px',
        backgroundColor: bgColor,
        borderRadius: bgShape === 'circle' ? '50%' : bgShape === 'star' ? '0' : '0',
        border: `5px solid ${bgOutline}`,
        position: 'relative',
    };

    const shapeStyle = shape === 'star'
        ? createStarShape(70, shapeColor, shapeOutline) // Add custom shape for star
        : {
            width: '60px',
            height: '60px',
            backgroundColor: shapeColor,
            borderRadius: shape === 'circle' ? '50%' : '0',
            border: `5px solid ${shapeOutline}`,
            position: 'absolute',
        };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog sx={{ display: 'flex', flexDirection: 'row' }}>
                <ModalClose />
                <DialogContent sx={{ width: '800px' }}>
                    <Box sx={{ flex: 1, paddingRight: '20px', display: 'flex', flexDirection: 'column' }}>
                        <Typography level="h4" gutterBottom sx={{ mb: 3 }}>Add Badge</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} lg={9}>
                                <form onSubmit={handleSubmit}>
                                    <Stack spacing={2}>
                                        <FormControl fullWidth>
                                            <FormLabel>Badge Title</FormLabel>
                                            <Input
                                                name="name"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                            />
                                        </FormControl>

                                        <FormControl fullWidth>
                                            <FormLabel>Badge Description</FormLabel>
                                            <Textarea
                                                name="description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                required
                                            />
                                        </FormControl>

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
                                                    <Option value="star">Star</Option> {/* Added star option */}
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

                                            <Box sx={{ width: '100%' }}>
                                                <FormLabel>Shape Outline Color</FormLabel>
                                                <Input
                                                    fullWidth
                                                    type="color"
                                                    value={shapeOutline}
                                                    onChange={(e) => setShapeOutline(e.target.value)}
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
                                                    <Option value="star">Star</Option> {/* Added star option */}
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
                                                <Option value="found-items">No. of Found Items</Option>
                                                <Option value="lost-items">No. of Lost Items</Option>
                                                <Option value="ratings">No. of Ratings</Option>
                                            </Select>
                                        </FormControl>

                                        <Button type="submit" fullWidth>Add Badge</Button>
                                    </Stack>
                                </form>
                            </Grid>
                            <Grid item xs={12} lg={3}>
                                <Typography level="h4" textAlign="center" gutterBottom>Preview</Typography>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px' }}>
                                    <Box sx={{ width: '150px', height: '150px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', borderRadius: '10px', padding: '10px', alignItems: 'center', justifyContent: 'center' }}>
                                        <Tooltip title={description} arrow>
                                            <Box sx={badgePreviewStyle}>
                                                <Box sx={shapeStyle}></Box>
                                            </Box>
                                        </Tooltip>
                                        <Typography sx={{ textAlign: 'center', marginTop: '10px' }} fontWeight="700">{title}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </ModalDialog>
        </Modal>
    );
};

export default AddBadgeModal;
