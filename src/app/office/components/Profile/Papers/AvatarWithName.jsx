import React from 'react'
import { Paper } from '@mui/material';
import { Avatar, Box, Typography } from '@mui/joy';

const AvatarWithName = ({ user }) => {
    return (
        <>
            <Paper elevation={2}>
                <Box
                    sx={{
                        padding: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Avatar src={user.avatar} sx={{ width: 76, height: 76, marginBottom: '1rem' }}>
                        <Typography level="h2">{user.name.charAt(0).toUpperCase()}</Typography>
                    </Avatar>
                    <Typography level='body-lg' fontWeight='500'>{user.name}</Typography>
                    <Typography level='body-sm' fontWeight='400'>{user.role}</Typography>
                </Box>
            </Paper>
        </>
    )
}

export default AvatarWithName