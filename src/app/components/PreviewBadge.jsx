import React from "react";
import { Tooltip, Box } from "@mui/joy";
import { useTheme, useMediaQuery } from "@mui/material";
import dayjs from "dayjs";

const PreviewBadge = ({ resolvedItemCount, shareCount, birthday, inherit }) => {
  const birthdayBadge = { shape: "birthdayCake", color: "#F44336" };

  const getResolvedBadge = () => {
    if (resolvedItemCount >= 10) {
      return { shape: "star", color: "#FFD700" }; // Gold star
    } else if (resolvedItemCount >= 5) {
      return { shape: "star", color: "#C0C0C0" }; // Silver star
    } else if (resolvedItemCount >= 1) {
      return { shape: "star", color: "#CD7F32" }; // Bronze star
    }
    return null;
  };

  const getShareBadge = () => {
    if (shareCount >= 10) {
      return { shape: "circle", color: "#FFD700" }; // Gold circle
    } else if (shareCount >= 5) {
      return { shape: "circle", color: "#C0C0C0" }; // Silver circle
    } else if (shareCount >= 1) {
      return { shape: "circle", color: "#CD7F32" }; // Bronze circle
    }
    return null;
  };

  const createStarShape = (size, color) => ({
    width: size,
    height: size,
    backgroundColor: color,
    clipPath:
      "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  });

  const createCircleShape = (size, color) => ({
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: "50%",
  });

  const createBirthdayGiftBadge = (size, boxColor, ribbonColor) => ({
    width: size,
    height: size * 0.8,
    backgroundColor: boxColor,
    borderRadius: `${size * 0.1}px`,
    position: "relative",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    "&::before": {
      // Vertical Ribbon
      content: '""',
      position: "absolute",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: size * 0.15,
      height: "100%",
      backgroundColor: ribbonColor,
    },
    "&::after": {
      // Horizontal Ribbon
      content: '""',
      position: "absolute",
      top: "50%",
      left: 0,
      transform: "translateY(-50%)",
      width: "100%",
      height: size * 0.15,
      backgroundColor: ribbonColor,
    },
    "& .bow": {
      position: "absolute",
      top: -size * 0.2,
      left: "50%",
      transform: "translateX(-50%)",
      width: size * 0.4,
      height: size * 0.2,
      backgroundColor: ribbonColor,
      borderRadius: `${size * 0.1}px`,
      "&::before, &::after": {
        content: '""',
        position: "absolute",
        width: size * 0.2,
        height: size * 0.2,
        backgroundColor: ribbonColor,
        borderRadius: "50%",
      },
      "&::before": {
        left: -size * 0.15,
        top: 0,
      },
      "&::after": {
        right: -size * 0.15,
        top: 0,
      },
    },
  });

  const createCheckmarkShape = (size, color) => ({
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    "&::before": {
      // Optional: Add slight shadow/depth to the badge
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "50%",
      boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.2)",
    },
    "&::after": {
      content: '""',
      width: `${size * 0.2}px`, // Slightly smaller width for better proportions
      height: `${size * 0.5}px`, // Reduced height for better checkmark look
      border: `${size * 0.12}px solid white`, // Dynamic border width based on size
      borderLeft: "0",
      borderTop: "0",
      transform: "rotate(45deg) translate(0, -70%)", // Adjusted positioning
      position: "absolute",
      top: "45%", // Moved slightly up
      transformOrigin: "center",
      boxShadow: "0 1px 1px rgba(0,0,0,0.1)", // Subtle shadow on the checkmark
    },
  });

  const createShape = (type, color) => {
    switch (type) {
      case "star":
        return createStarShape(20, color);
      case "checkmark":
        return createCheckmarkShape(18, color);
      default:
        return createCircleShape(14, color);
    }
  };

  const resolvedBadge = getResolvedBadge();
  const shareBadge = getShareBadge();

  const isBirthdayToday =
    dayjs(birthday).format("MM-DD") === dayjs().format("MM-DD");
  const noBadges = !resolvedBadge && !shareBadge && !isBirthdayToday;

  if (noBadges) return null;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: noBadges || inherit ? "transparent" : "#e0e0e0", // Remove background if no badges
        px: noBadges ? 0 : 1, // Remove padding if no badges
        borderRadius: "5px",
      }}
    >
      {birthdayBadge && isBirthdayToday && (
        <Tooltip title="Happy Birthday!" arrow placement="top">
          <Box
            sx={{
              ...createBirthdayGiftBadge(20, "#FF4081", "#FFC107"), // Box: Pink, Ribbon: Yellow
              display: "inline-block",
            }}
          >
            <Box className="bow" />
          </Box>
        </Tooltip>
      )}

      {resolvedBadge && (
        <Tooltip
          title={`Resolved Items: ${resolvedItemCount}`}
          arrow
          placement="top"
        >
          <Box
            sx={{
              ...createShape(resolvedBadge.shape, resolvedBadge.color),
              display: "inline-block",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          />
        </Tooltip>
      )}
      {shareBadge && (
        <Tooltip title={`Shares: ${shareCount}`} arrow placement="top">
          <Box
            sx={{
              ...createShape(shareBadge.shape, shareBadge.color),
              display: "inline-block",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default PreviewBadge;
