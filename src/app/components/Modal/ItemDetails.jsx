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
                                    row?.matched &&
                                    <tr>
                                        <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px' }}><strong>Lost Item Details</strong></td>
                                        <td style={{ borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', textAlign: 'center', width: '50px' }}>
                                            <Tooltip title="Category" arrow>
                                                <CategoryIcon />
                                            </Tooltip>
                                        </td>
                                        <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}><strong>Found Item Details</strong></td>
                                    </tr>
                                }
                                {
                                    row?.matched &&
                                    <tr>
                                        <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px' }}><strong>{row.matched.owner.firstname} {row.matched.owner.lastname}</strong></td>
                                        <td style={{ borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', textAlign: 'center', width: '50px' }}>
                                            <Tooltip title="Person" arrow>
                                                <PersonIcon />
                                            </Tooltip>
                                        </td>
                                        <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}><strong>{row.finder.firstname} {row.finder.lastname}</strong></td>
                                    </tr>
                                }
                                <tr>
                                    {row?.matched && <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px' }}>{row.matched.name}</td>}
                                    <td style={{ borderLeft: row.matched ? '1px solid black' : 'none', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                        <Tooltip title="Name" arrow>
                                            <Inventory2Icon />
                                        </Tooltip>
                                    </td>
                                    <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>{row.name}</td>
                                </tr>
                                <tr>
                                   {row?.matched && <td style={{ borderBottom: '1px solid black', padding: '8px' }}>{row.matched.description}</td>}
                                    <td style={{ borderLeft: row.matched ? '1px solid black' : 'none', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                        <Tooltip title="Description" arrow>
                                            <DescriptionIcon />
                                        </Tooltip>
                                    </td>
                                    <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>{row.description}</td>
                                </tr>
                                <tr>
                                    {row?.matched && <td style={{ borderBottom: '1px solid black', padding: '8px' }}>{row.matched.location}</td>}
                                    <td style={{ borderLeft: row.matched ? '1px solid black' : 'none', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                        <Tooltip title={row?.matched ? 'Location' : row?.finder ? 'Found Location' : 'Lost Location'} arrow>
                                            <LocationOnIcon />
                                        </Tooltip>
                                    </td>
                                    <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>{row.location}</td>
                                </tr>
                                <tr>
                                    {row?.matched && <td style={{ borderBottom: '1px solid black', padding: '8px' }}>{format(parseISO(row.matched.date), 'MMMM dd, yyyy')}</td>}
                                    <td style={{ borderLeft: row.matched ? '1px solid black' : 'none', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                        <Tooltip title={row?.matched ? 'Date' : row?.finder ? 'Found Date' : 'Lost Date'} arrow>
                                            <CalendarTodayIcon />
                                        </Tooltip>
                                    </td>
                                    <td style={{ borderBottom: '1px solid black', padding: '8px', width: '150px', textAlign: 'right' }}>
                                        {format(parseISO(row.date), 'MMMM dd, yyyy')}
                                    </td>
                                </tr>
                                <tr>
                                {row?.matched && <td style={{ padding: '8px' }}>{format(new Date().setHours(...row.matched.time.split(':')), 'hh:mm a')}</td>}
                                    <td style={{ borderLeft: row.matched ? '1px solid black' : 'none', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold', width: '50px', textAlign: 'center' }}>
                                        <Tooltip title={row?.matched ? 'Time' : row?.finder ? 'Found Time' : 'Lost Time'} arrow>
                                            <AccessTimeIcon />
                                        </Tooltip>
                                    </td>
                                    <td style={{ padding: '8px', width: '150px', textAlign: 'right' }}>
                                        {format(new Date().setHours(...row.time.split(':')), 'hh:mm a')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </TabPanel>
                    <TabPanel value="2" sx={{ padding: { xs: 1, lg: 2 } }}>
                        {
                            !row?.matched ? 
                            <>
                                {
                                    row.dateRequest &&
                                    <>
                                        <Typography fontWeight="700">Date Request:</Typography>
                                        <Typography>{format(parseISO(row.dateRequest), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                    </>
                                }
                                {
                                    row.dateValidating &&
                                    <>
                                        <Typography fontWeight="700">Date Approved:</Typography>
                                        <Typography>{format(parseISO(row.dateValidating), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                    </>
                                }
                                {
                                    row.datePublished &&
                                    <>
                                        <Typography fontWeight="700">Date Published:</Typography>
                                        <Typography>{format(parseISO(row.datePublished), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                    </>
                                }
                                {
                                    row.dateInvalid &&
                                    <>
                                        <Typography fontWeight="700">Date Invalid:</Typography>
                                        <Typography>{format(parseISO(row.dateInvalid), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                    </>
                                }
                            </>
                        :
                            <>
                                {
                                    row.dateClaimRequest &&
                                    <>
                                        <Typography fontWeight="700">Date Claim Request:</Typography>
                                        <Typography>{format(parseISO(row.dateClaimRequest), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                    </>
                                }
                                {
                                    row.dateReserved &&
                                    <>
                                        <Typography fontWeight="700">Date Reserved:</Typography>
                                        <Typography>{format(parseISO(row.dateReserved), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                    </>
                                }
                            </>
                        }
                        {
                            row?.owner &&
                            <>
                                {
                                    row.dateRequest &&
                                    <>
                                        <Typography fontWeight="700">Date Request:</Typography>
                                        <Typography>{format(parseISO(row.dateRequest), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                    </>
                                }
                                {
                                    row.dateMissing &&
                                    <>
                                        <Typography fontWeight="700">Date Missing:</Typography>
                                        <Typography>{format(parseISO(row.dateMissing), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                    </>
                                }
                                {
                                    row.dateTracked &&
                                    <>
                                        <Typography fontWeight="700">Date Tracked:</Typography>
                                        <Typography>{format(parseISO(row.dateTracked), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                    </>
                                }
                            </>
                        }
                    </TabPanel>
                    <TabPanel value="3" sx={{ padding: { xs: 1, lg: 2, overflowY: 'auto' } }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', lg: 'row' },
                                gap: 2, // Space between the two images
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Lost Item Image */}
                            {
                                (row?.matched || row?.owner) &&
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography level="h5" sx={{ marginBottom: 1 }}>
                                        Lost Item
                                    </Typography>
                                    <CldImage
                                        src={row?.matched ? row?.matched.image : row.image}
                                        width={200}
                                        height={200}
                                        alt={row?.matched ? row?.matched.name : row.name}
                                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        style={{
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                </Box>
                            }

                            {/* Found Item Image */}
                            {
                                (row?.matched || row?.finder) &&
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography level="h5" sx={{ marginBottom: 1 }}>
                                        Found Item
                                    </Typography>
                                    <CldImage
                                        src={row.image}
                                        width={200}
                                        height={200}
                                        alt={row.name}
                                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        style={{
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                </Box>
                            }
                        </Box>
                    </TabPanel>
                </Tabs>
            </Box>
        </>
    )
}

export default ItemDetails