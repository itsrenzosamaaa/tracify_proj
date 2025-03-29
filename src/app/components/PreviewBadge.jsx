import React from "react";
import { Box, Tooltip } from "@mui/joy";
import { Fade } from "@mui/material";
import dayjs from "dayjs";

const PreviewBadge = ({ resolvedItemCount, shareCount, birthday, inherit }) => {
  const isBirthdayToday =
    birthday && dayjs(birthday).format("MM-DD") === dayjs().format("MM-DD");

  const getResolvedLevel = () => {
    if (resolvedItemCount >= 20)
      return {
        shape: "star",
        color: "#DAA520",
        label: "Legendary Finder",
        s,
      };
    if (resolvedItemCount >= 10)
      return {
        shape: "star",
        color: "#FFD700",
        label: "Gold Resolver",
      };
    if (resolvedItemCount >= 5)
      return {
        shape: "star",
        color: "#C0C0C0",
        label: "Silver Solver",
      };
    if (resolvedItemCount >= 1)
      return {
        shape: "star",
        color: "#CD7F32",
        label: "Bronze Seeker",
      };
    return null;
  };

  const getShareLevel = () => {
    if (shareCount >= 20)
      return {
        shape: "circle",
        color: "#DAA520",
        label: "Master Broadcaster",
      };
    if (shareCount >= 10)
      return {
        shape: "circle",
        color: "#FFD700",
        label: "Top Sharer",
      };
    if (shareCount >= 5)
      return {
        shape: "circle",
        color: "#C0C0C0",
        label: "Amateur Sharer",
      };
    if (shareCount >= 1)
      return {
        shape: "circle",
        color: "#CD7F32",
        label: "Rookie Sharer",
      };
    return null;
  };

  const StarBadge = ({ color }) => (
    <Box
      sx={{
        width: 16,
        height: 16,
        backgroundColor: color,
        clipPath:
          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        border: "1px solid rgba(0,0,0,0.4)",
        transition: "transform 0.3s ease-in-out",
        "&:hover": { transform: "scale(1.2)" },
      }}
    />
  );

  const CircleBadge = ({ color }) => (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        backgroundColor: color,
        border: "1.5px solid white",
        transition: "transform 0.3s ease-in-out",
        "&:hover": { transform: "scale(1.2)" },
      }}
    />
  );

  const GiftBadge = () => (
    <Box
      sx={{
        width: 16,
        height: 16,
        backgroundColor: "#ff4081",
        borderRadius: "4px",
        position: "relative",
        border: "1px solid #d81b60",

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "2px",
          height: "100%",
          backgroundColor: "#fff176", // vertical ribbon
        },
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: "100%",
          height: "2px",
          backgroundColor: "#fff176", // horizontal ribbon
        },
        "& .bow": {
          position: "absolute",
          top: "-6px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderBottom: "6px solid #fff176",
        },
      }}
    >
      <Box className="bow" />
    </Box>
  );

  const resolvedBadge = getResolvedLevel();
  const shareBadge = getShareLevel();
  const noBadges = !resolvedBadge && !shareBadge && !isBirthdayToday;

  if (noBadges) return null;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: inherit ? "transparent" : "#f5f5f5",
        px: 1,
        py: 0.5,
        borderRadius: 8,
      }}
    >
      {isBirthdayToday && (
        <Tooltip
          title="🎂 It's Your Special Day!"
          arrow
          placement="top"
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 300 }}
        >
          <Box component="span">
            <GiftBadge />
          </Box>
        </Tooltip>
      )}

      {resolvedBadge && (
        <Tooltip
          title={`${resolvedBadge.label}: ${resolvedItemCount}`}
          arrow
          placement="top"
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 300 }}
        >
          <Box component="span">
            <StarBadge color={resolvedBadge.color} />
          </Box>
        </Tooltip>
      )}

      {shareBadge && (
        <Tooltip
          title={`${shareBadge.label}: ${shareCount}`}
          arrow
          placement="top"
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 300 }}
        >
          <Box component="span">
            <CircleBadge color={shareBadge.color} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default PreviewBadge;
