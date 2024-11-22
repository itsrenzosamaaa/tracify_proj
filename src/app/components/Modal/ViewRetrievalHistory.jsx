import { Modal, ModalClose, ModalDialog, Typography, AspectRatio, Card, CardContent, Chip, Box, DialogContent } from '@mui/joy'
import React from 'react'
import { CldImage } from 'next-cloudinary'

const ViewRetrievalHistory = ({ open, onClose, retrievalItems }) => {
    console.log(retrievalItems)
    return (
        <>
            <Modal open={open} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4">Retrieval History</Typography>
                    <DialogContent>
                        {retrievalItems.length > 0 ? (
                            retrievalItems.map((retrievalItem, index) => (
                                <Card
                                    key={retrievalItem._id}
                                    variant="outlined"
                                    orientation="horizontal"
                                    sx={{
                                        width: 320,
                                        '&:hover': { boxShadow: 'md', borderColor: 'neutral.outlinedHoverBorder' },
                                    }}
                                >
                                    <AspectRatio ratio="1" sx={{ width: 90 }}>
                                        <CldImage
                                            priority
                                            src={retrievalItem.owner.item.images[0]}
                                            width={250} // Adjusted width to match smaller card size
                                            height={250} // Adjusted height to match smaller card size
                                            alt={retrievalItem.owner.item.name || "Item Image"}
                                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            style={{ objectFit: 'fill' }}
                                        />
                                    </AspectRatio>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography level="title-lg" id="card-description">
                                                {retrievalItem.finder.item.name}
                                            </Typography>
                                            <Chip
                                                variant="solid"
                                                color={retrievalItem.request_status === 'Canceled' ? 'warning' : retrievalItem.request_status === 'Declined' ? 'danger' : 'success'}
                                                size="sm"
                                                sx={{ pointerEvents: 'none' }}
                                            >
                                                {retrievalItem.request_status}
                                            </Chip>
                                        </Box>
                                        <Typography
                                            level="body-sm"
                                            aria-describedby="card-description"
                                            sx={{ mb: 1 }}
                                        >
                                            {retrievalItem.finder.item.description}
                                        </Typography>
                                        <Typography
                                            level="body-sm"
                                            aria-describedby="card-description"
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
        </>
    )
}

export default ViewRetrievalHistory