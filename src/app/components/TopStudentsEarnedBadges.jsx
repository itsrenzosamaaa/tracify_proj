import React from 'react'
import { Typography, Table, Box } from '@mui/joy';
import { Card, CardContent, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const TopStudentsEarnedBadges = ({ users }) => {
    const sortedUsers = users
        .map(user => ({
            ...user,
            badgeCount: user.badges.length,
        }))
        .sort((a, b) => b.badgeCount - a.badgeCount)
        .slice(0, 10);
    return (
        <>
            <Typography level="h3" gutterBottom>
                Top Students
            </Typography>
            <Card sx={{ height: '390px' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <TableContainer sx={{ flex: 1, overflowY: 'auto', maxHeight: 350 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Rank</strong></TableCell>
                                    <TableCell><strong>Student Name</strong></TableCell>
                                    <TableCell><strong>Badges Earned</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedUsers.map((user, index) => {
                                    // Determine the color based on rank
                                    const color =
                                        index === 0
                                            ? '#FFD700' // Gold
                                            : index === 1
                                                ? '#C0C0C0' // Silver
                                                : index === 2
                                                    ? '#CD7F32' // Bronze
                                                    : 'inherit';

                                    return (
                                        <TableRow key={user._id}>
                                            <TableCell sx={{ fontWeight: 'bold', color: color }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: 35, // width of the circle
                                                        height: 35, // height of the circle
                                                        borderRadius: '50%',
                                                        border: '1px solid black',
                                                        backgroundColor: color === 'inherit' ? 'transparent' : color,
                                                        color: '#000000',
                                                    }}
                                                >
                                                    {index + 1}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{user.firstname} {user.lastname}</TableCell>
                                            <TableCell>{user.badgeCount}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </>
    )
}

export default TopStudentsEarnedBadges