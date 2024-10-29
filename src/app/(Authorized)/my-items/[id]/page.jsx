'use client'

import { Box, Typography, Card, Divider, Stack, Button } from '@mui/joy';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

const ViewItemPage = ({ params }) => {
    const { id } = params;
    const [selectedItem, setSelectedItem] = useState(null);
    const router = useRouter();

    console.log(selectedItem);

    const fetchItem = useCallback(async () => {
        try {
            const response = await fetch(`/api/found-items/${id}`);
            if (!response.ok) throw new Error('Failed to fetch item');
            const data = await response.json();
            setSelectedItem(data);
        } catch (error) {
            console.error(error);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id, fetchItem]);

    return (
        <>
            {selectedItem ? (
                <Card variant="outlined" sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography level="h2">{selectedItem.name}</Typography>
                            <Button onClick={() => router.push('/my-items')} color='danger'>Back</Button>
                        </Box>
                        <Typography level="body2" color="neutral">
                            Status: {selectedItem.status}
                        </Typography>

                        <Box
                            component="img"
                            src={selectedItem.image}
                            alt={selectedItem.name}
                            sx={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 'md' }}
                        />

                        <Divider />

                        <Typography level="body2" color="neutral">
                            <strong>Found by:</strong> {selectedItem.finder.firstname} {selectedItem.finder.lastname}
                        </Typography>
                        <Typography level="body2" color="neutral">
                            <strong>Contact:</strong> {selectedItem.finder.contactNumber}
                        </Typography>
                        <Typography
                            level="body2"
                            color="neutral"
                            sx={{
                                whiteSpace: { xs: 'nowrap', lg: 'normal' },
                                overflow: { xs: 'hidden', lg: 'visible' },
                                textOverflow: { xs: 'ellipsis', lg: 'clip' },
                                maxWidth: { xs: '200px', lg: 'none' }, // Adjust the max width as needed
                                display: 'inline-block',
                            }}
                        >
                            <strong>Email:</strong> {selectedItem.finder.emailAddress}
                        </Typography>

                        <Divider />

                        <Typography level="body2" color="neutral">
                            <strong>Description:</strong> {selectedItem.description}
                        </Typography>
                        <Typography level="body2" color="neutral">
                            <strong>Location Found:</strong> {selectedItem.location}
                        </Typography>

                        <Divider />

                        <Typography level="body2" color="neutral">
                            <strong>Date Found:</strong> {new Date(selectedItem.date).toLocaleDateString()}
                        </Typography>
                        <Typography level="body2" color="neutral">
                            <strong>Published On:</strong> {new Date(selectedItem.datePublished).toLocaleDateString()}
                        </Typography>

                        <Divider />

                        <Typography level="body2" color="neutral">
                            <strong>Claim Location:</strong> {selectedItem.monitoredBy.role.name}
                        </Typography>
                        <Typography level="body2" color="neutral">
                            <strong>Claim Address:</strong> {selectedItem.monitoredBy.office_location}
                        </Typography>

                        <Divider />

                        <Button fullWidth color="success">
                            Claim Request
                        </Button>
                    </Stack>
                </Card>
            ) : (
                <Typography>Loading...</Typography>
            )}
        </>
    );
};

export default ViewItemPage;
