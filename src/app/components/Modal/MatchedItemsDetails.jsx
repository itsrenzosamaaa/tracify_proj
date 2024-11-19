'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Avatar,
    Grid,
    Stepper,
    Step,
    Divider,
} from '@mui/joy';
import { CldImage } from 'next-cloudinary';
import { format, isToday } from 'date-fns';

const MatchedItemsDetails = ({ row }) => {
    return (
        <>
            <Card
                variant="outlined"
                sx={{
                    maxWidth: 1000,
                    margin: 'auto',
                    padding: 3,
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
                    <Grid container spacing={2}>
                        <Grid item xs={12} lg={6}>
                            <Box sx={{ marginBottom: 4 }}>
                                <Typography
                                    level="h5"
                                    sx={{
                                        marginBottom: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.plainColor',
                                    }}
                                >
                                    Owner Information
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 3,
                                        padding: 2,
                                        bgcolor: 'background.level1',
                                        borderRadius: 'md',
                                        boxShadow: 'sm',
                                    }}
                                >
                                    {/* Avatar */}
                                    <Avatar sx={{ width: 80, height: 80 }} />

                                    {/* User Details */}
                                    <Stack spacing={1} sx={{ flex: 1, width: '100%' }}>
                                        <Typography
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                width: '100%', // Ensure container width is respected
                                            }}
                                            fontWeight="700"
                                        >
                                            {row.owner.user?.firstname || 'N/A'} {row.owner.user?.lastname || 'N/A'}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                width: '100%',
                                            }}
                                        >
                                            {row.owner.user?.emailAddress || 'N/A'}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                width: '100%',
                                            }}
                                        >
                                            {row.owner.user?.contactNumber || 'N/A'}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <Box sx={{ marginBottom: 4 }}>
                                <Typography
                                    level="h5"
                                    sx={{
                                        marginBottom: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.plainColor',
                                    }}
                                >
                                    Finder Information
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 3,
                                        padding: 2,
                                        bgcolor: 'background.level1',
                                        borderRadius: 'md',
                                        boxShadow: 'sm',
                                    }}
                                >
                                    {/* Avatar */}
                                    <Avatar sx={{ width: 80, height: 80 }} />

                                    {/* User Details */}
                                    <Stack spacing={1} sx={{ flex: 1, width: '100%' }}>
                                        <Typography
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                width: '100%', // Ensure container width is respected
                                            }}
                                            fontWeight="700"
                                        >
                                            {row.finder.user?.firstname || 'N/A'} {row.finder.user?.lastname || 'N/A'}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                width: '100%',
                                            }}
                                        >
                                            {row.finder.user?.emailAddress || 'N/A'}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                width: '100%',
                                            }}
                                        >
                                            {row.finder.user?.contactNumber || 'N/A'}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <Box sx={{ marginBottom: 4 }}>
                                <Typography
                                    level="h5"
                                    sx={{
                                        marginBottom: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.plainColor',
                                    }}
                                >
                                    Lost Item Information
                                </Typography>
                                <Box
                                    sx={{
                                        bgcolor: 'background.level1',
                                        borderRadius: 'md',
                                        boxShadow: 'sm',
                                        padding: 3,
                                    }}
                                >
                                    <Typography>
                                        <strong>Name:</strong> {row.owner.item.name || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Color:</strong> {row.owner.item.color || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Size:</strong> {row.owner.item.size || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Category:</strong> {row.owner.item.category || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Material:</strong> {row.owner.item.material || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Condition:</strong> {row.owner.item.condition || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Distinctive Marks:</strong> {row.owner.item.distinctiveMarks || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Location:</strong> {row.owner.item.location || 'N/A'}
                                    </Typography>

                                    {/* Description and Date/Time */}
                                    <Divider sx={{ marginY: 2 }} />

                                    <strong>Description:</strong>
                                    <Typography>
                                        {row.owner.item.description || 'N/A'}
                                    </Typography>
                                    <strong>Start Date Lost:</strong>
                                    <Typography>
                                        {row.owner.item.date_time?.split(' to ')[0] || 'Unidentified'}
                                    </Typography>
                                    <strong>End Date Lost:</strong>
                                    <Typography>
                                        {row.owner.item.date_time?.split(' to ')[1] || 'Unidentified'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <Box sx={{ marginBottom: 4 }}>
                                <Typography
                                    level="h5"
                                    sx={{
                                        marginBottom: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.plainColor',
                                    }}
                                >
                                    Found Item Information
                                </Typography>
                                <Box
                                    sx={{
                                        bgcolor: 'background.level1',
                                        borderRadius: 'md',
                                        boxShadow: 'sm',
                                        padding: 3,
                                    }}
                                >
                                    <Typography>
                                        <strong>Name:</strong> {row.finder.item.name || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Color:</strong> {row.finder.item.color || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Size:</strong> {row.finder.item.size || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Category:</strong> {row.finder.item.category || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Material:</strong> {row.finder.item.material || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Condition:</strong> {row.finder.item.condition || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Distinctive Marks:</strong> {row.finder.item.distinctiveMarks || 'N/A'}
                                    </Typography>
                                    <Typography>
                                        <strong>Location:</strong> {row.finder.item.location || 'N/A'}
                                    </Typography>

                                    {/* Description and Date/Time */}
                                    <Divider sx={{ marginY: 2 }} />

                                    <strong>Description:</strong>
                                    <Typography>
                                        {row.finder.item.description || 'N/A'}
                                    </Typography>
                                    <strong>Date Found:</strong>
                                    <Typography>
                                        {format(new Date(row.finder.item.date_time), 'MMMM dd, yyyy')}
                                    </Typography>
                                    <strong>Time Found:</strong>
                                    <Typography>
                                        {format(new Date(row.finder.item.date_time), 'hh:mm a')}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ marginBottom: 4 }}>
                                <Typography
                                    level="h5"
                                    sx={{
                                        marginBottom: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.plainColor',
                                    }}
                                >
                                    Item Records
                                </Typography>
                                <Box
                                    sx={{
                                        bgcolor: 'background.level1',
                                        borderRadius: 'md',
                                        boxShadow: 'sm',
                                        padding: 3,
                                    }}
                                >
                                    <Stepper orientation="vertical">
                                        {row.datePending && (
                                            <Step>
                                                <Typography>
                                                    <strong>The retrieval request has been sent!</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(row.datePending))
                                                        ? `Today, ${format(new Date(row.datePending), 'hh:mm a')}`
                                                        : format(new Date(row.datePending), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {row.dateApproved && (
                                            <Step>
                                                <Typography>
                                                    <strong>{row.datePending ? 'The item has been approved!' : 'The item has been matched!'}</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(row.dateApproved))
                                                        ? `Today, ${format(new Date(row.dateApproved), 'hh:mm a')}`
                                                        : format(new Date(row.dateApproved), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        )}
                                        {row.dateCanceled &&
                                            <Step>
                                                <Typography>
                                                    <strong>The request has been canceled.</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(row.dateCanceled))
                                                        ? `Today, ${format(new Date(row.dateCanceled), 'hh:mm a')}`
                                                        : format(new Date(row.dateCanceled), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        }
                                        {row.dateDecline &&
                                            <Step>
                                                <Typography>
                                                    <strong>The request has been declined.</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(row.dateDecline))
                                                        ? `Today, ${format(new Date(row.dateDecline), 'hh:mm a')}`
                                                        : format(new Date(row.dateDecline), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        }
                                        {row.dateCompleted &&
                                            <Step>
                                                <Typography>
                                                    <strong>The item has been resolved!</strong>
                                                </Typography>
                                                <Typography>
                                                    {isToday(new Date(row.dateCompleted))
                                                        ? `Today, ${format(new Date(row.dateCompleted), 'hh:mm a')}`
                                                        : format(new Date(row.dateCompleted), 'MMMM dd, yyyy, hh:mm a')}
                                                </Typography>
                                            </Step>
                                        }
                                    </Stepper>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <Box>
                                <Typography
                                    level="h5"
                                    sx={{
                                        marginBottom: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.plainColor',
                                    }}
                                >
                                    Lost Item Image
                                </Typography>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 0,
                                        paddingBottom: '100%', // Maintain a square aspect ratio
                                        position: 'relative', // Enable absolute positioning for the content
                                        bgcolor: 'background.level1',
                                        borderRadius: 'md',
                                        boxShadow: 'sm',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                    }}
                                    onClick={() => window.open(row.owner.item?.image || '#', '_blank')}
                                >
                                    {row.owner.item?.image ? (
                                        <CldImage
                                            src={row.owner.item.image}
                                            width={200}
                                            height={200}
                                            alt={row.owner.item?.name || 'Item Image'}
                                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                            }}
                                        />
                                    ) : (
                                        <Typography
                                            sx={{
                                                fontStyle: 'italic',
                                                color: 'text.secondary',
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                textAlign: 'center',
                                            }}
                                        >
                                            No image available
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <Box>
                                <Typography
                                    level="h5"
                                    sx={{
                                        marginBottom: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.plainColor',
                                    }}
                                >
                                    Found Item Image
                                </Typography>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 0,
                                        paddingBottom: '100%', // Maintain a square aspect ratio
                                        position: 'relative', // Enable absolute positioning for the content
                                        bgcolor: 'background.level1',
                                        borderRadius: 'md',
                                        boxShadow: 'sm',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                    }}
                                    onClick={() => window.open(row.finder.item?.image || '#', '_blank')}
                                >
                                    {row.finder.item?.image ? (
                                        <CldImage
                                            src={row.finder.item.image}
                                            width={200}
                                            height={200}
                                            alt={row.finder.item?.name || 'Item Image'}
                                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                            }}
                                        />
                                    ) : (
                                        <Typography
                                            sx={{
                                                fontStyle: 'italic',
                                                color: 'text.secondary',
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                textAlign: 'center',
                                            }}
                                        >
                                            No image available
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
};

export default MatchedItemsDetails;