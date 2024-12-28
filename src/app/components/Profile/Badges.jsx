import React, { useState } from "react";
import {
  Paper,
  Grid,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { Box, Modal, ModalClose, ModalDialog, Typography } from "@mui/joy";
import AddCircleIcon from "@mui/icons-material/AddCircle"; // Add icon
import PreviewBadge from "../PreviewBadge";

const Badges = ({ badges, profile }) => {
  const [viewBadgeModal, setViewBadgeModal] = useState(null);
  return (
    <>
      <Paper
        elevation={2}
        sx={{
          padding: "1rem",
          maxHeight: "17.8rem", // Limit the height
          overflowY: "auto", // Enable vertical scrolling
          textAlign: "center",
          borderTop: "3px solid #3f51b5",
        }}
      >
        <Grid container spacing={2}>
          {badges && badges.length > 0 ? (
            badges.map((badge) => {
              const isObtained = profile.badges.includes(badge._id);
              const conditionType =
                badge.condition === "Found Item/s"
                  ? profile.resolvedItemCount
                  : profile.ratingsCount;
              const description =
                badge.condition === "Found Item/s"
                  ? `Resolve ${badge.meetConditions} successful found item/s`
                  : `Provide ${badge.meetConditions} user rating/s`;

              return (
                <Grid
                  item
                  key={badge._id}
                  xs={3}
                  md={4}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {/* Badge Preview */}
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
                          transform: isObtained ? "scale(1.1)" : "none",
                        },
                      }}
                    />
                  </Box>

                  {/* Progress Bar */}
                  {!isObtained && conditionType < badge.meetConditions && (
                    <LinearProgress
                      variant="determinate"
                      value={(conditionType / badge.meetConditions) * 100}
                      sx={{
                        width: "80%",
                        height: "6px",
                        borderRadius: "4px",
                      }}
                    />
                  )}

                  {/* Badge Modal */}
                  <Modal
                    open={viewBadgeModal === badge._id}
                    onClose={() => setViewBadgeModal(null)}
                  >
                    <ModalDialog>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
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
                                transform: isObtained ? "scale(1.1)" : "none",
                              },
                            }}
                          />
                        </Box>
                        {!isObtained &&
                          conditionType < badge.meetConditions && (
                            <>
                              <LinearProgress
                                variant="determinate"
                                value={
                                  (conditionType / badge.meetConditions) * 100
                                }
                                sx={{
                                  width: "50%",
                                  height: "6px",
                                  borderRadius: "4px",
                                  marginBottom: "-6px",
                                }}
                              />
                              <Typography level="body-xs">
                                {`${conditionType}/${badge.meetConditions}`}
                              </Typography>
                              <Typography level="body-md">
                                {description}
                              </Typography>
                            </>
                          )}
                      </Box>
                    </ModalDialog>
                  </Modal>
                </Grid>
              );
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
          )}
        </Grid>
      </Paper>
    </>
  );
};

export default Badges;
