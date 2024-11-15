'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Divider,
    Stack,
    Avatar,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tooltip,
} from '@mui/joy';
import { CldImage } from 'next-cloudinary';
import PreviewBadge from '../PreviewBadge';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Zoom from '@mui/material/Zoom';

const ItemDetails = ({ row }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card
            variant="outlined"
            sx={{
                maxWidth: 800,
                margin: 'auto',
                padding: 3,
                borderRadius: 'md',
                boxShadow: 'lg',
                bgcolor: 'background.surface',
            }}
        >
            {/* Header */}
            <Typography
                level="h4"
                textAlign="center"
                sx={{
                    marginBottom: 3,
                    fontWeight: 'bold',
                    color: 'text.primary',
                }}
            >
                Item Details
            </Typography>

            <CardContent>
                {/* User Details */}
                <Box>
                    <Typography
                        level="h6"
                        sx={{
                            marginBottom: 2,
                            fontWeight: 'bold',
                            color: 'primary.plainColor',
                            textAlign: 'center',
                        }}
                    >
                        User Information
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 2,
                            bgcolor: 'background.level1',
                            borderRadius: 'md',
                            boxShadow: 'sm',
                            gap: 2,
                        }}
                    >
                        {/* Avatar Section */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Avatar sx={{ width: 80, height: 80, margin: 'auto' }} />
                        </Box>

                        {/* User Details Section */}
                        <Stack spacing={1} sx={{ flex: 1 }}>
                            <Typography>
                                {row.user?.firstname || 'N/A'} {row.user?.lastname || 'N/A'}
                            </Typography>
                            <Typography>{row.user?.emailAddress || 'N/A'}</Typography>
                            <Typography>{row.user?.contactNumber || 'N/A'}</Typography>
                        </Stack>

                        {/* Badge Section */}
                        <Box
                            sx={{
                                textAlign: 'center',
                                maxWidth: 200,
                                bgcolor: 'background.surface',
                                borderRadius: 'md',
                                padding: 2,
                                boxShadow: 'xs',
                            }}
                        >
                            {row.user?.selectedBadge ? (
                                <PreviewBadge
                                    title={row.user.selectedBadge.title}
                                    titleColor={row.user.selectedBadge.titleColor}
                                    titleShimmer={row.user.selectedBadge.titleShimmer}
                                    titleOutlineColor={row.user.selectedBadge.titleOutlineColor}
                                    description={row.user.selectedBadge.description}
                                    shape={row.user.selectedBadge.shape}
                                    shapeColor={row.user.selectedBadge.shapeColor}
                                    bgShape={row.user.selectedBadge.bgShape}
                                    bgColor={row.user.selectedBadge.bgColor}
                                    bgOutline={row.user.selectedBadge.bgOutline}
                                />
                            ) : (
                                <Typography
                                    sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                                >
                                    No badge displayed
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ marginY: 3 }} />

                {/* Item Details */}
                <Box
                    sx={{
                        bgcolor: 'background.level1',
                        borderRadius: 'md',
                        boxShadow: 'sm',
                        padding: 2,
                        marginBottom: 2,
                    }}
                >
                    <Accordion sx={{ boxShadow: 3 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography level="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                Item Information
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={2} sx={{ marginTop: 2 }}>
                                {/* Item Details Box */}
                                <Box sx={{ marginBottom: 2 }}>
                                    {/* Item Name */}
                                    <Typography level="body1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                        <strong>Name:</strong> {row.item.name || 'N/A'}
                                    </Typography>

                                    {/* Item Color */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Color:</strong> {row.item.color || 'N/A'}
                                    </Typography>

                                    {/* Item Size */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Size:</strong> {row.item.size || 'N/A'}
                                    </Typography>

                                    {/* Item Category */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Category:</strong> {row.item.category || 'N/A'}
                                    </Typography>

                                    {/* Item Material */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Material:</strong> {row.item.material || 'N/A'}
                                    </Typography>

                                    {/* Item Condition */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Condition:</strong> {row.item.condition || 'N/A'}
                                    </Typography>

                                    {/* Item Description */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Description:</strong> {row.item.description || 'N/A'}
                                    </Typography>

                                    {/* Distinctive Marks */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Distinctive Marks:</strong> {row.item.distinctiveMarks || 'N/A'}
                                    </Typography>

                                    {/* Item Location */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Location:</strong> {row.item.location || 'N/A'}
                                    </Typography>

                                    {/* Item Date */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Date:</strong> {new Date(row.item.date).toLocaleDateString() || 'N/A'}
                                    </Typography>

                                    {/* Item Time */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Time:</strong> {row.item.time || 'N/A'}
                                    </Typography>

                                    {/* Item Status */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Status:</strong> {row.item.status || 'N/A'}
                                    </Typography>

                                    {/* Date Published */}
                                    <Typography level="body1" sx={{ color: 'text.primary' }}>
                                        <strong>Date Published:</strong> {new Date(row.item.datePublished).toLocaleString() || 'N/A'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                </Box>

                <Divider sx={{ marginY: 3 }} />

                {/* Item Image */}
                <Box textAlign="center">
                    <Typography
                        level="h6"
                        sx={{
                            marginBottom: 2,
                            fontWeight: 'bold',
                            color: 'primary.plainColor',
                        }}
                    >
                        Item Image
                    </Typography>
                    <Box
                        sx={{
                            borderRadius: 'md',
                            overflow: 'hidden',
                            boxShadow: 'sm',
                            display: 'inline-block',
                            cursor: 'pointer',
                        }}
                        onClick={() => window.open(row.item?.image || '#', '_blank')}
                    >
                        {row.item?.image ? (
                            <CldImage
                                src={row.item.image}
                                width={300}
                                height={300}
                                alt={row.item?.name || 'Item Image'}
                                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                            />
                        ) : (
                            <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                No image available
                            </Typography>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ItemDetails;
