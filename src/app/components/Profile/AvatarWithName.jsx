import React, { useState } from 'react';
import { Paper, useTheme, useMediaQuery } from '@mui/material';
import { Avatar, Box, Typography, Menu, MenuItem, MenuButton, Dropdown } from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChangeProfilePicture from '../Modal/ChangeProfilePicture';
import ChangeUsername from '../Modal/ChangeUsername';
import EditIcon from '@mui/icons-material/Edit';

const AvatarWithName = ({ profile, session, refreshData, setOpenSnackbar, setMessage }) => {
    const [image, setImage] = useState(profile.profile_picture || null);
    const [openModal, setOpenModal] = useState(false);
    const [openUsernameModal, setOpenUsernameModal] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <>
            <Paper
                elevation={2}
                sx={{
                    borderTop: '3px solid #3f51b5',
                    padding: '1rem',
                    display: 'flex',
                    gap: { xs: 2, md: 0 },
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                }}
            >
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    {image ? (
                        <Avatar
                            alt={`${profile.firstname} ${profile.lastname}'s Profile Picture`}
                            src={profile.profile_picture}
                            sx={{
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                boxShadow: 2,
                            }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                marginBottom: '1rem',
                                backgroundColor: 'primary.light',
                            }}
                        >
                            <Typography level="h2">
                                {profile.firstname?.charAt(0).toUpperCase() || 'U'}
                            </Typography>
                        </Avatar>
                    )}
                    {/* Pencil Icon */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 7,
                            right: 7,
                            backgroundColor: '#f5f5f5',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 1,
                            cursor: 'pointer',
                            border: '2px solid white',
                        }}
                        onClick={() => {
                            setOpenModal(true);
                        }}
                    >
                        <EditIcon sx={{ fontSize: 16 }} />
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography level="body-lg" fontWeight="500">
                        {profile.firstname} {profile.lastname}
                    </Typography>
                    <Typography level="body-sm" fontWeight="400">
                        {profile._id}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: '100%',
                        mt: 3,
                        textAlign: isXs ? 'left' : '',
                    }}
                >
                    {[
                        { label: 'Username', value: profile.username },
                        { label: 'Contact Number', value: profile.contactNumber },
                        { label: 'Email Address', value: profile.emailAddress },
                    ].map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                alignItems: { xs: 'flex-start', md: 'center' },
                                justifyContent: 'space-between',
                                mb: { xs: 2, md: 1 },
                                gap: { xs: 0.5, md: 0 }, // Ensures spacing between label and value
                            }}
                        >
                            <Typography
                                level="body-md"
                                fontWeight="700"
                                sx={{
                                    flexShrink: 0, // Ensures labels don't squish in tight spaces
                                    textAlign: { xs: 'left', md: 'left' }, // Aligns labels properly
                                    width: { md: '30%' }, // Consistent label width on larger screens
                                }}
                            >
                                {item.label} {' '}
                                {
                                    item.label === 'Username'
                                        ? <EditIcon sx={{ fontSize: 16, cursor: 'pointer' }} onClick={() => setOpenUsernameModal(true)} />
                                        : ''
                                }
                            </Typography>
                            <Typography
                                sx={{
                                    textAlign: { xs: 'left', md: 'right' }, // Keeps values aligned to the left
                                    wordBreak: 'break-word', // Prevents overflow for long text
                                    width: { md: '70%' }, // Consistent value width on larger screens
                                }}
                            >
                                {item.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>
            <ChangeProfilePicture loading={loading} setImage={setImage} setLoading={setLoading} refreshData={refreshData} session={session} setOpenSnackbar={setOpenSnackbar} setOpenModal={setOpenModal} openModal={openModal} />
            <ChangeUsername session={session} profile={profile} openUsernameModal={openUsernameModal} setOpenUsernameModal={setOpenUsernameModal} refreshData={refreshData} setOpenSnackbar={setOpenSnackbar} setMessage={setMessage} />
        </>
    );
};

export default AvatarWithName;
