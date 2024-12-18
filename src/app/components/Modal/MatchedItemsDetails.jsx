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
import { format, isToday } from 'date-fns';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { CldImage } from 'next-cloudinary';
import { useTheme, useMediaQuery } from '@mui/material';

const MatchedItemsDetails = ({ row }) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    return (
        <>
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
                            <Avatar
                                alt={`${row.owner.user.firstname} ${row.owner.user.lastname}'s Profile Picture`}
                                src={row.owner.user.profile_picture}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    boxShadow: 2,
                                }}
                            />

                            {/* User Details */}
                            <Stack spacing={1} sx={{ flex: 1, width: '100%' }}>
                                <Typography
                                    level={isXs ? 'body-sm' : 'body-md'}
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
                                    level={isXs ? 'body-sm' : 'body-md'}
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
                                    level={isXs ? 'body-sm' : 'body-md'}
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
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Name:</strong> {row.owner.item.name || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Color:</strong> {row.owner.item.color || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Size:</strong> {row.owner.item.size || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Category:</strong> {row.owner.item.category || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Material:</strong> {row.owner.item.material || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Condition:</strong> {row.owner.item.condition || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Distinctive Marks:</strong> {row.owner.item.distinctiveMarks || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Location:</strong> {row.owner.item.location || 'N/A'}
                            </Typography>

                            {/* Description and Date/Time */}
                            <Divider sx={{ marginY: 2 }} />

                            <strong>Description:</strong>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                {row.owner.item.description || 'N/A'}
                            </Typography>
                            <strong>Start Date Lost:</strong>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                {row.owner.item.date_time?.split(' to ')[0] || 'Unidentified'}
                            </Typography>
                            <strong>End Date Lost:</strong>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
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
                            <Avatar
                                alt={`${row.finder.user.firstname} ${row.finder.user.lastname}'s Profile Picture`}
                                src={row.finder.user.profile_picture}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    boxShadow: 2,
                                }}
                            />

                            {/* User Details */}
                            <Stack spacing={1} sx={{ flex: 1, width: '100%' }}>
                                <Typography
                                    level={isXs ? 'body-sm' : 'body-md'}
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
                                    level={isXs ? 'body-sm' : 'body-md'}
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
                                    level={isXs ? 'body-sm' : 'body-md'}
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
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Name:</strong> {row.finder.item.name || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Color:</strong> {row.finder.item.color || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Size:</strong> {row.finder.item.size || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Category:</strong> {row.finder.item.category || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Material:</strong> {row.finder.item.material || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Condition:</strong> {row.finder.item.condition || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Distinctive Marks:</strong> {row.finder.item.distinctiveMarks || 'N/A'}
                            </Typography>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                <strong>Location:</strong> {row.finder.item.location || 'N/A'}
                            </Typography>

                            {/* Description and Date/Time */}
                            <Divider sx={{ marginY: 2 }} />

                            <strong>Description:</strong>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                {row.finder.item.description || 'N/A'}
                            </Typography>
                            <strong>Date Found:</strong>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
                                {format(new Date(row.finder.item.date_time), 'MMMM dd, yyyy')}
                            </Typography>
                            <strong>Time Found:</strong>
                            <Typography level={isXs ? 'body-sm' : 'body-md'}>
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
                                {row.dateCompleted &&
                                    <Step>
                                        <Typography level={isXs ? 'body-sm' : isSm ? 'body-md' : 'body-lg'}>
                                            <strong>The item has been resolved!</strong>
                                        </Typography>
                                        <Typography level={isXs ? 'body-xs' : isSm ? 'body-sm' : 'body-md'}>
                                            {isToday(new Date(row.dateCompleted))
                                                ? `Today, ${format(new Date(row.dateCompleted), 'hh:mm a')}`
                                                : format(new Date(row.dateCompleted), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                }
                                {row.dateDeclined &&
                                    <Step>
                                        <Typography level={isXs ? 'body-sm' : isSm ? 'body-md' : 'body-lg'}>
                                            <strong>{row.dateApproved ? 'The claim process has been declined.' : 'The request has been declined.'}</strong>
                                        </Typography>
                                        <Typography>
                                            <strong>Remarks: </strong>{row.remarks}
                                        </Typography>
                                        <Typography level={isXs ? 'body-xs' : isSm ? 'body-sm' : 'body-md'}>
                                            {isToday(new Date(row.dateDeclined))
                                                ? `Today, ${format(new Date(row.dateDeclined), 'hh:mm a')}`
                                                : format(new Date(row.dateDeclined), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                }
                                {row.dateCanceled &&
                                    <Step>
                                        <Typography level={isXs ? 'body-sm' : isSm ? 'body-md' : 'body-lg'}>
                                            <strong>The request has been canceled.</strong>
                                        </Typography>
                                        <Typography level={isXs ? 'body-sm' : isSm ? 'body-md' : 'body-lg'}>
                                            <strong>Remarks: </strong>{row.remarks}
                                        </Typography>
                                        <Typography level={isXs ? 'body-xs' : isSm ? 'body-sm' : 'body-md'}>
                                            {isToday(new Date(row.dateCanceled))
                                                ? `Today, ${format(new Date(row.dateCanceled), 'hh:mm a')}`
                                                : format(new Date(row.dateCanceled), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                }
                                {row.dateApproved && (
                                    <Step>
                                        <Typography level={isXs ? 'body-sm' : isSm ? 'body-md' : 'body-lg'}>
                                            <strong>{row.datePending ? 'The item has been approved!' : 'The item has been matched!'}</strong>
                                        </Typography>
                                        <Typography level={isXs ? 'body-xs' : isSm ? 'body-sm' : 'body-md'}>
                                            {isToday(new Date(row.dateApproved))
                                                ? `Today, ${format(new Date(row.dateApproved), 'hh:mm a')}`
                                                : format(new Date(row.dateApproved), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
                                {row.datePending && (
                                    <Step>
                                        <Typography level={isXs ? 'body-sm' : isSm ? 'body-md' : 'body-lg'}>
                                            <strong>The retrieval request has been sent!</strong>
                                        </Typography>
                                        <Typography level={isXs ? 'body-xs' : isSm ? 'body-sm' : 'body-md'}>
                                            {isToday(new Date(row.datePending))
                                                ? `Today, ${format(new Date(row.datePending), 'hh:mm a')}`
                                                : format(new Date(row.datePending), 'MMMM dd, yyyy, hh:mm a')}
                                        </Typography>
                                    </Step>
                                )}
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
                        <Carousel showThumbs={false} useKeyboardArrows>
                            {
                                row.owner.item?.images?.map((image, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            overflow: 'hidden',
                                            display: 'inline-block',
                                            margin: 1, // Adds some spacing between images
                                        }}
                                    >
                                        <CldImage
                                            src={image}
                                            width={250}
                                            height={250}
                                            alt={row.owner.item?.name || 'Item Image'}
                                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                        />
                                    </Box>
                                ))
                            }
                        </Carousel>
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
                        <Carousel showThumbs={false} useKeyboardArrows>
                            {
                                row.finder.item?.images?.map((image, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            overflow: 'hidden',
                                            display: 'inline-block',
                                            margin: 1, // Adds some spacing between images
                                        }}
                                    >
                                        <CldImage
                                            src={image}
                                            width={250}
                                            height={250}
                                            alt={row.finder.item?.name || 'Item Image'}
                                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                                        />
                                    </Box>
                                ))
                            }
                        </Carousel>
                    </Box>
                </Grid>
            </Grid>
        </>
    );
};

export default MatchedItemsDetails;