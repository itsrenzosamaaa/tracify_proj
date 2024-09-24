import React from 'react';
import { Table, Typography, Button, IconButton } from '@mui/joy';
import { TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';

const DepTable = ({ data, type }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: { xs: '8rem', lg: '10rem' } }}>
                            <Typography fontWeight="bold">ID</Typography>
                        </TableCell>
                        <TableCell sx={{ width: { xs: '8rem', lg: '10rem' } }}>
                            <Typography fontWeight="bold">Name</Typography>
                        </TableCell>
                        {/* Conditionally render Email column for larger screens */}
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                            <Typography fontWeight="bold">Email</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography fontWeight="bold">Actions</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item._id}>
                            <TableCell sx={{ width: { xs: '8rem', lg: '10rem' } }}>{item.accountId}</TableCell>
                            <TableCell sx={{ width: { xs: '8rem', lg: '10rem' } }}>
                                {/* Conditionally render based on type */}
                                {type === 'user' ? item.firstname.split(' ')[0] : item.officeName}
                            </TableCell>
                            {/* Conditionally render Email cell for larger screens */}
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                                {item.email}
                            </TableCell>
                            <TableCell sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    sx={{
                                        display: { xs: 'none', lg: 'block' },
                                        minWidth: '80px', // Consistent button size for large screens
                                    }}
                                >
                                    More Details
                                </Button>
                                <IconButton
                                    size="small"
                                    sx={{
                                        display: { xs: 'block', lg: 'none' },
                                        minWidth: '40px', // Small button size for small screens
                                    }}
                                >
                                    <MoreHoriz />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DepTable;
