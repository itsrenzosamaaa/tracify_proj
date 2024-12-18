import React, { useState } from "react";
import { Paper, Grid, DialogActions, DialogContent, DialogTitle, Button, IconButton, LinearProgress } from '@mui/material';
import { Box, Modal, ModalClose, ModalDialog, Typography } from '@mui/joy';
import AddCircleIcon from '@mui/icons-material/AddCircle'; // Add icon
import PreviewBadge from "../PreviewBadge";

const Badges = ({ badges, profile }) => {
    const [viewBadgeModal, setViewBadgeModal] = useState(null);
    return (
        <>
            <Paper
                elevation={2}
                sx={{
                    padding: "1rem",
                    minHeight: "17.8rem",
                    textAlign: "center",
                    borderTop: '3px solid #3f51b5',
                }}
            >
                <Grid container spacing={2}>
                    {
                        badges && badges.length > 0 ? (
                            badges.map(badge => {
                                const isObtained = (profile.badges).includes(badge._id);
                                const conditionType = badge.condition === 'Found Item/s' ? profile.resolvedItemCount : profile.ratingsCount;
                                const description = badge.condition === 'Found Item/s' ? `Resolved ${badge.meetConditions} successful found item/s` : `Provide ${badge.meetConditions} user rating/s`;

                                return (
                                    <Grid
                                        item
                                        key={badge._id}
                                        xs={3}
                                        md={4}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center", // Center horizontally
                                            justifyContent: "center", // Center vertically if needed
                                            gap: "8px", // Adds space between badge and progress bar
                                            width: "100%", // Ensure the container takes full width
                                        }}
                                    >
                                        <Box
                                            onClick={() => setViewBadgeModal(badge._id)}
                                            sx={{
                                                filter: isObtained ? "none" : "brightness(0.4)",
                                                transition: "filter 0.3s ease",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <PreviewBadge
                                                title={badge.title}
                                                titleShimmer={badge.titleShimmer}
                                                shape={badge.shape}
                                                shapeColor={badge.shapeColor}
                                                bgShape={badge.bgShape}
                                                bgColor={badge.bgColor}
                                                bgOutline={badge.bgOutline}
                                                sx={{
                                                    transition: "transform 0.3s ease",
                                                    "&:hover": {
                                                        transform: isObtained ? "scale(1.1)" : "none", // Only scale if obtained
                                                    },
                                                }}
                                            />
                                        </Box>
                                        {
                                            !isObtained && (conditionType < badge.meetConditions) &&
                                            <LinearProgress
                                                variant="determinate"
                                                value={Math.min(
                                                    (conditionType / badge.meetConditions) * 100,
                                                    100
                                                )}
                                                sx={{
                                                    width: "80%", // Ensure the progress bar width looks good
                                                    height: "6px", // Adjust thickness of the progress bar
                                                    borderRadius: "4px", // Optional: Rounded edges
                                                }}
                                            />
                                        }
                                        <Modal open={viewBadgeModal === badge._id} onClose={() => setViewBadgeModal(null)}>
                                            <ModalDialog>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center", // Center horizontally
                                                        justifyContent: "center", // Center vertically if needed
                                                        gap: "8px", // Adds space between badge and progress bar
                                                    }}
                                                >
                                                    <Typography level="h3" sx={{ mb: 2 }}>
                                                        {badge.title}
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            filter: isObtained ? "none" : "brightness(0.4)",
                                                            transition: "filter 0.3s ease",
                                                            mb: 2,
                                                        }}
                                                    >
                                                        <PreviewBadge
                                                            title={badge.title}
                                                            titleShimmer={badge.titleShimmer}
                                                            shape={badge.shape}
                                                            shapeColor={badge.shapeColor}
                                                            bgShape={badge.bgShape}
                                                            bgColor={badge.bgColor}
                                                            bgOutline={badge.bgOutline}
                                                            sx={{
                                                                transition: "transform 0.3s ease",
                                                                "&:hover": {
                                                                    transform: isObtained ? "scale(1.1)" : "none", // Only scale if obtained
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                    {
                                                        !isObtained && (conditionType < badge.meetConditions) &&
                                                        <>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={Math.min(
                                                                    (conditionType / badge.meetConditions) * 100,
                                                                    100
                                                                )}
                                                                sx={{
                                                                    width: "50%", // Ensure the progress bar width looks good
                                                                    height: "6px", // Adjust thickness of the progress bar
                                                                    borderRadius: "4px", // Optional: Rounded edges
                                                                    marginBottom: '-6px',
                                                                }}
                                                            />
                                                            <Typography level="body-xs">
                                                                {`${conditionType}/${badge.meetConditions}`}
                                                            </Typography>
                                                            <Typography level='body-md'>
                                                                {description}
                                                            </Typography>
                                                        </>
                                                    }
                                                </Box>
                                            </ModalDialog>
                                        </Modal>
                                    </Grid>
                                )
                            })
                        ) : (
                            <Typography
                                level="body1"
                                sx={{
                                    color: "#666",
                                    fontStyle: "italic",
                                    marginTop: "2rem",
                                }}
                            >
                                No badges available at the moment.
                            </Typography>
                        )
                    }
                </Grid>
            </Paper>
        </>
    );
};

export default Badges;
