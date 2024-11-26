import React from 'react';
import { Paper } from '@mui/material';
import { Avatar, Box, Typography } from '@mui/joy';

const AvatarWithName = ({ user, image }) => {
    return (
        <>
            <Box sx={{ padding: '1rem 1rem 1rem 0' }}>
                <Typography level="body-lg" fontWeight="500">Name</Typography>
            </Box>
            <Paper
                elevation={2}
                sx={{
                    padding: '1rem',
                    display: 'flex',
                    gap: { xs: 2, md: 0 },
                    flexDirection: { xs: '', md: 'column' },
                    alignItems: 'center',
                }}
            >
                {image ? (
                    <Avatar
                        alt={`${user.firstname} ${user.lastname}'s Profile Picture`}
                        src={user.profile_picture}
                        sx={{
                            width: { xs: 70, sm: 92 },
                            height: { xs: 70, sm: 92 },
                            borderRadius: '50%',
                            boxShadow: 2,
                        }}
                    />
                ) : (
                    <Avatar
                        sx={{
                            width: 76,
                            height: 76,
                            marginBottom: '1rem',
                            backgroundColor: 'primary.light',
                        }}
                    >
                        <Typography level="h2">
                            {user.firstname?.charAt(0).toUpperCase() || 'U'}
                        </Typography>
                    </Avatar>
                )}
                <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                    <Typography level="body-lg" fontWeight="500">
                        {user.firstname} {user.lastname}
                    </Typography>
                    <Typography level="body-sm" fontWeight="400">
                        {user.username}
                    </Typography>
                </Box>
            </Paper>
        </>
    );
};

export default AvatarWithName;
