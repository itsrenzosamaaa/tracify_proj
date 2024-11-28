import React, { useState } from 'react';
import { Paper } from '@mui/material';
import { Avatar, Box, Typography, Menu, MenuItem, MenuButton, Dropdown } from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChangeProfilePicture from '../Modal/ChangeProfilePicture';
import ChangeUsername from '../Modal/ChangeUsername';

const AvatarWithName = ({ profile, session, refreshData, setOpenSnackbar }) => {
    const [image, setImage] = useState(profile.profile_picture || null);
    const [openModal, setOpenModal] = useState(false);
    const [openUsernameModal, setOpenUsernameModal] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <>
            <Box sx={{ padding: '1rem 1rem 1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography level="body-lg" fontWeight="500">Name</Typography>
                <Dropdown>
                    <MenuButton variant="plain" size="small" startDecorator={<MoreVertIcon />} />
                    <Menu>
                        <MenuItem onClick={() => setOpenModal(true)}>
                            Change Profile Picture
                        </MenuItem>
                        <MenuItem onClick={() => setOpenUsernameModal(true)}>
                            Change Username
                        </MenuItem>
                        <MenuItem onClick={() => setOpenPasswordModal(true)}>
                            Change Password
                        </MenuItem>
                    </Menu>
                </Dropdown>
                <ChangeProfilePicture loading={loading} setImage={setImage} setLoading={setLoading} refreshData={refreshData} session={session} setOpenSnackbar={setOpenSnackbar} setOpenModal={setOpenModal} openModal={openModal} />
                <ChangeUsername session={session} profile={profile} openUsernameModal={openUsernameModal} setOpenUsernameModal={setOpenUsernameModal} refreshData={refreshData} setOpenSnackbar={setOpenSnackbar} />
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
                        alt={`${profile.firstname} ${profile.lastname}'s Profile Picture`}
                        src={profile.profile_picture}
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
                            {profile.firstname?.charAt(0).toUpperCase() || 'U'}
                        </Typography>
                    </Avatar>
                )}
                <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                    <Typography level="body-lg" fontWeight="500">
                        {profile.firstname} {profile.lastname}
                    </Typography>
                    <Typography level="body-sm" fontWeight="400">
                        {profile.username}
                    </Typography>
                </Box>
            </Paper>
        </>
    );
};

export default AvatarWithName;
