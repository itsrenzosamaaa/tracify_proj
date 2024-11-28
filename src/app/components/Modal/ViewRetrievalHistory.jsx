import { Modal, ModalClose, ModalDialog, Typography, AspectRatio, Card, CardContent, Chip, Box, DialogContent } from '@mui/joy'
import React from 'react'
import { CldImage } from 'next-cloudinary'
import { useTheme, useMediaQuery } from '@mui/material';

const ViewRetrievalHistory = ({ open, onClose, retrievalItems }) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog>
                <ModalClose />
                <Typography level={isXs ? 'h4' : 'h3'} sx={{ textAlign: 'center', mb: 2 }}>Retrieval History</Typography>
                <DialogContent>
                    {retrievalItems.length > 0 ? (
                        retrievalItems.map((retrievalItem) => (
                            <Card
                                key={retrievalItem._id}
                                variant="outlined"
                                orientation="horizontal"
                                sx={{
                                    display: 'flex',
                                    flexDirection: isXs ? 'column' : 'row', // Change layout based on screen size
                                    gap: 2,
                                    '&:hover': { boxShadow: 'md', borderColor: 'neutral.outlinedHoverBorder' },
                                    mb: 2, // Add margin bottom to separate cards
                                }}
                            >
                                <AspectRatio ratio="1" sx={{ width: isXs ? '100%' : 90 }}>
                                    <CldImage
                                        priority
                                        src={retrievalItem.finder.item.images[0]}
                                        width={250} // Adjusted width to match smaller card size
                                        height={250} // Adjusted height to match smaller card size
                                        alt={retrievalItem.finder.item.name || "Item Image"}
                                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        style={{ objectFit: 'cover' }} // Use 'cover' for better image aspect
                                    />
                                </AspectRatio>
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography
                                            level={isXs ? 'h5' : 'h4'}
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            {retrievalItem.finder.item.name}
                                        </Typography>
                                        <Chip
                                            variant="solid"
                                            color={retrievalItem.request_status === 'Canceled' ? 'warning' : retrievalItem.request_status === 'Declined' ? 'danger' : 'success'}
                                            size="sm"
                                            sx={{ pointerEvents: 'none', alignSelf: isXs ? 'flex-start' : 'center' }}
                                        >
                                            {retrievalItem.request_status}
                                        </Chip>
                                    </Box>

                                    <Typography
                                        level={isXs ? 'body-sm' : 'body-md'}
                                        sx={{ mb: 1 }}
                                    >
                                        {retrievalItem.finder.item.description}
                                    </Typography>

                                    <Typography
                                        level={isXs ? 'body-sm' : 'body-md'}
                                        sx={{ mb: 1 }}
                                    >
                                        <strong>Remarks: </strong>{retrievalItem.remarks}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Typography>No retrieval history available.</Typography>
                    )}
                </DialogContent>
            </ModalDialog>
        </Modal>
    )
}

export default ViewRetrievalHistory;
