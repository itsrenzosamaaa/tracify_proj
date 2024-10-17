import React from 'react'
import { Paper } from '@mui/material';
import { Avatar, Box, Typography } from '@mui/joy';

const AvatarWithName = ({ user, role }) => {
    return (
        <>
            <Box sx={{ padding: '1rem 1rem 1rem 0' }}>
                <Typography level="body-lg" fontWeight='500'>Name</Typography>
            </Box>
            <Paper elevation={2}
                sx={{
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                <Avatar sx={{ width: 76, height: 76, marginBottom: '1rem' }}>
                    <Typography level="h2">{user.firstname.charAt(0).toUpperCase()}</Typography>
                </Avatar>
                <Typography level='body-lg' fontWeight='500'>{user.firstname} {user.lastname}</Typography>
                <Typography level='body-sm' fontWeight='400'>{role && role.name.charAt(0).toUpperCase() + role.name.slice(1)}</Typography>
            </Paper>
        </>
    )
}

export default AvatarWithName