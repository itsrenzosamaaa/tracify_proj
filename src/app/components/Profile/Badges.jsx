import React, { useState } from "react";
import { Paper, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { Box, Typography } from '@mui/joy';
import PreviewBadge from "../PreviewBadge";

const Badges = ({ user }) => {
    const [selectedBadge, setSelectedBadge] = useState(user.selectedBadge || null);
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleBadgeRemove = async () => {
        setSelectedBadge(null);

        try {
            const response = await fetch(`/api/users/${user._id}/selected-badge`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ badgeId: null }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove selected badge');
            }
        } catch (error) {
            console.error('Error removing badge:', error);
        }
    };

    const handleBadgeSelect = async (badge) => {
        setSelectedBadge(badge);

        try {
            const response = await fetch(`/api/users/${user._id}/selected-badge`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ badgeId: badge._id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update selected badge');
            }

            handleCloseDialog();
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    };

    return (
        <>
            <Box sx={{ padding: '1rem 1rem 1rem 0' }}>
                <Typography level="body-lg" fontWeight="500">Badge</Typography>
            </Box>

            <Paper
                elevation={2}
                sx={{
                    position: 'relative',
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    minHeight: '8.75rem',
                    maxHeight: '8.75rem',
                }}
            >
                <Typography
                    level="body-sm"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                    }}
                    onClick={selectedBadge ? handleBadgeRemove : handleOpenDialog}
                >
                    {selectedBadge ? 'Remove' : 'Select'}
                </Typography>
                {selectedBadge ? (
                    <Box onClick={handleOpenDialog} sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <PreviewBadge
                            title={selectedBadge.title}
                            titleColor={selectedBadge.titleColor}
                            titleShimmer={selectedBadge.titleShimmer}
                            titleOutlineColor={selectedBadge.titleOutlineColor}
                            description={selectedBadge.description}
                            shape={selectedBadge.shape}
                            shapeColor={selectedBadge.shapeColor}
                            bgShape={selectedBadge.bgShape}
                            bgColor={selectedBadge.bgColor}
                            bgOutline={selectedBadge.bgOutline}
                        />
                    </Box>
                ) : (
                    <Typography level="body-md" sx={{ textAlign: 'center' }}>Select your badges here</Typography>
                )}
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Select a Badge to Display on Your Profile</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {user.badges?.map((badge) => (
                            <Box
                                key={badge._id}
                                sx={{
                                    width: '150px',
                                    height: '150px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    marginBottom: '1rem',
                                    border: selectedBadge?._id === badge._id ? '3px solid #1976d2' : 'none',
                                }}
                                onClick={() => handleBadgeSelect(badge)}
                            >
                                <PreviewBadge
                                    title={badge.title}
                                    titleColor={badge.titleColor}
                                    titleShimmer={badge.titleShimmer}
                                    titleOutlineColor={badge.titleOutlineColor}
                                    description={badge.description}
                                    shape={badge.shape}
                                    shapeColor={badge.shapeColor}
                                    bgShape={badge.bgShape}
                                    bgColor={badge.bgColor}
                                    bgOutline={badge.bgOutline}
                                />
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Badges;
