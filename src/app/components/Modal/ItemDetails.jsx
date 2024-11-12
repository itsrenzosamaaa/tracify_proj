'use client'

import React, { useState } from 'react'
import { format, parseISO } from 'date-fns';
import { CldImage } from 'next-cloudinary';
import { Tab, Tabs, TabPanel, TabList, Box, Typography } from '@mui/joy';
import { Tooltip } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import DescriptionIcon from '@mui/icons-material/Description';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';

const ItemDetails = ({ row }) => {
    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <>
            <Box sx={{ marginTop: 2 }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="item request tabs"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <TabList
                        sx={{ gap: { xs: 1, lg: 2 } }}
                    >
                        <Tab value="1" sx={{ fontSize: { xs: '0.875rem', lg: '1rem' } }}>Details</Tab>
                        <Tab value="2" sx={{ fontSize: { xs: '0.875rem', lg: '1rem' } }}>Records</Tab>
                        <Tab value="3" sx={{ fontSize: { xs: '0.875rem', lg: '1rem' } }}>Image</Tab>
                    </TabList>
                    <TabPanel value="1" sx={{ padding: { xs: 1, lg: 2, overflowY: 'auto' } }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {
                                    (row.owner && row.finder) ?
                                        <>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px' }}><strong>Lost Item Details</strong></td>
                                                <td style={{ borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', textAlign: 'center', width: '50px' }}>
                                                    <Tooltip title="Category" arrow>
                                                        <CategoryIcon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}><strong>Found Item Details</strong></td>
                                            </tr>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px' }}><strong>{row?.owner?.user?.firstname} {row?.owner?.user?.lastname}</strong></td>
                                                <td style={{ borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', textAlign: 'center', width: '50px' }}>
                                                    <Tooltip title="Person" arrow>
                                                        <PersonIcon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}><strong>{row?.finder?.user?.firstname} {row?.finder?.user?.lastname}</strong></td>
                                            </tr>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px' }}>{row?.owner?.item?.name}</td>
                                                <td style={{ borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                                    <Tooltip title="Name" arrow>
                                                        <Inventory2Icon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>{row?.finder?.item?.name}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px' }}>{row?.owner?.item?.description}</td>
                                                <td style={{ borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                                    <Tooltip title="Description" arrow>
                                                        <DescriptionIcon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>{row?.finder?.item?.description}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px' }}>{row?.owner?.item?.location}</td>
                                                <td style={{ borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                                    <Tooltip title="Location" arrow>
                                                        <LocationOnIcon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>{row?.finder?.item?.location}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px' }}>{format(parseISO(row?.owner?.item?.date), 'MMMM dd, yyyy')}</td>
                                                <td style={{ borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                                    <Tooltip title="Date" arrow>
                                                        <CalendarTodayIcon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>{format(parseISO(row?.finder?.item?.date), 'MMMM dd, yyyy')}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '8px', width: '150px' }}>{format(new Date().setHours(...row?.owner?.item?.time.split(':')), 'hh:mm a')}</td>
                                                <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                                    <Tooltip title="Time" arrow>
                                                        <AccessTimeIcon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ padding: '8px', width: '150px', textAlign: 'right' }}>{format(new Date().setHours(...row?.finder?.item?.time.split(':')), 'hh:mm a')}</td>
                                            </tr>
                                        </>
                                        :
                                        <>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                                    <Tooltip title="Name" arrow>
                                                        <Inventory2Icon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>{row.item.name}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                                    <Tooltip title="Description" arrow>
                                                        <DescriptionIcon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>{row.item.description}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                                    <Tooltip title={row?.item?.isFoundItem ? 'Found Location' : 'Lost Location'} arrow>
                                                        <LocationOnIcon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>{row.item.location}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                                    <Tooltip title={row?.item?.isFoundItem ? 'Found Date' : 'Lost Date'} arrow>
                                                        <CalendarTodayIcon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>
                                                    {format(parseISO(row.item.date), 'MMMM dd, yyyy')}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                                    <Tooltip title={row?.item?.isFoundItem ? 'Found Time' : 'Lost Time'} arrow>
                                                        <AccessTimeIcon />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ padding: '8px', width: '150px', textAlign: 'right' }}>
                                                    {format(new Date().setHours(...row.item.time.split(':')), 'hh:mm a')}
                                                </td>
                                            </tr>
                                        </>
                                }
                            </tbody>
                        </table>
                    </TabPanel>
                    <TabPanel value="2" sx={{ padding: { xs: 1, lg: 2 } }}>
                        {
                            !row.finder && !row.owner && (
                                <>
                                    {row.item.dateRequest && (
                                        <>
                                            <Typography fontWeight="700">Date Request:</Typography>
                                            <Typography>{format(parseISO(row.item.dateRequest), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                        </>
                                    )}
                                    {row.item.dateValidating && (
                                        <>
                                            <Typography fontWeight="700">Date Approved:</Typography>
                                            <Typography>{format(parseISO(row.item.dateValidating), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                        </>
                                    )}
                                    {row.item.datePublished && (
                                        <>
                                            <Typography fontWeight="700">Date Published:</Typography>
                                            <Typography>{format(parseISO(row.item.datePublished), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                        </>
                                    )}
                                    {row.item.dateMissing && (
                                        <>
                                            <Typography fontWeight="700">Date Missing:</Typography>
                                            <Typography>{format(parseISO(row.item.dateMissing), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                        </>
                                    )}
                                    {row.item.dateTracked && (
                                        <>
                                            <Typography fontWeight="700">Date Tracked:</Typography>
                                            <Typography>{format(parseISO(row.item.dateTracked), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                        </>
                                    )}
                                    {row.item.dateInvalid && (
                                        <>
                                            <Typography fontWeight="700">Date Invalid:</Typography>
                                            <Typography>{format(parseISO(row.item.dateInvalid), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                        </>
                                    )}
                                </>
                            )
                        }
                        {row.dateClaimRequest && (
                            <>
                                <Typography fontWeight="700">Date Claim Request:</Typography>
                                <Typography>{format(parseISO(row.dateClaimRequest), 'MMMM dd, yyyy hh:mm a')}</Typography>
                            </>
                        )}
                        {row.dateReserved && (
                            <>
                                <Typography fontWeight="700">Date Reserved:</Typography>
                                <Typography>{format(parseISO(row.dateReserved), 'MMMM dd, yyyy hh:mm a')}</Typography>
                            </>
                        )}
                    </TabPanel>
                    <TabPanel value="3" sx={{ padding: { xs: 1, lg: 2 }, overflowY: 'auto' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', lg: 'row' },
                                gap: 2, // Space between the images
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Render Lost and Found Items if both exist, otherwise render based on isFoundItem */}
                            {(row?.finder && row?.owner) ? (
                                <>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography level="h5" sx={{ marginBottom: 1 }}>
                                            Lost Item
                                        </Typography>
                                        <CldImage
                                            src={row.owner.item.image}
                                            width={200}
                                            height={200}
                                            alt={row.owner.item.name}
                                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            style={{
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography level="h5" sx={{ marginBottom: 1 }}>
                                            Found Item
                                        </Typography>
                                        <CldImage
                                            src={row.finder.item.image}
                                            width={200}
                                            height={200}
                                            alt={row.finder.item.name}
                                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            style={{
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                            }}
                                        />
                                    </Box>
                                </>
                            ) : !row?.item.isFoundItem ? (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography level="h5" sx={{ marginBottom: 1 }}>
                                        Lost Item
                                    </Typography>
                                    <CldImage
                                        src={row.item.image}
                                        width={200}
                                        height={200}
                                        alt={row.item.name}
                                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        style={{
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography level="h5" sx={{ marginBottom: 1 }}>
                                        Found Item
                                    </Typography>
                                    <CldImage
                                        src={row.item.image}
                                        width={200}
                                        height={200}
                                        alt={row.item.name}
                                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        style={{
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </TabPanel>
                </Tabs>
            </Box>
        </>
    )
}

export default ItemDetails