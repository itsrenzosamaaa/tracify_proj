"use client";

import React from "react";
import { Box, Tooltip, Typography } from "@mui/joy";
import dayjs from "dayjs";

const PreviewBadge = ({ resolvedItemCount, shareCount, birthday, inherit }) => {
  const isBirthdayToday =
    birthday && dayjs(birthday).format("MM-DD") === dayjs().format("MM-DD");

  const getResolvedSymbol = () => {
    if (resolvedItemCount >= 20)
      return {
        icon: "⭐",
        description: "You've returned 20+ items. You're a Legendary Finder!",
      };
    if (resolvedItemCount >= 10)
      return {
        icon: "⭐",
        description: "You've returned 10+ items. Great work, Gold Resolver!",
      };
    if (resolvedItemCount >= 5)
      return {
        icon: "⭐",
        description: "You've returned 5+ items. You're a Silver Solver!",
      };
    if (resolvedItemCount >= 1)
      return {
        icon: "⭐",
        description: "You've resolved your first item. You're a Bronze Seeker!",
      };
    return null;
  };

  const getShareSymbol = () => {
    if (shareCount >= 20)
      return {
        icon: "⚪",
        description: "Shared over 20 posts! You're a Master Broadcaster.",
      };
    if (shareCount >= 10)
      return {
        icon: "⚪",
        description: "You've shared 10+ posts. You're a Top Sharer.",
      };
    if (shareCount >= 5)
      return {
        icon: "⚪",
        description: "You've shared 5+ posts. You're an Amateur Sharer.",
      };
    if (shareCount >= 1)
      return {
        icon: "⚪",
        description: "First share done. You're a Rookie Sharer!",
      };
    return null;
  };

  const resolved = getResolvedSymbol();
  const shared = getShareSymbol();

  const noBadges = !resolved && !shared && !isBirthdayToday;
  if (noBadges) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        flexWrap: "wrap",
        backgroundColor: inherit ? "transparent" : "#f5f5f5",
        px: 1,
        py: 0.25,
        borderRadius: 8,
      }}
    >
      {isBirthdayToday && (
        <Tooltip
          title="🎂 It's your birthday! Wishing you a special day!"
          arrow
        >
          <Typography fontSize="sm" sx={{ cursor: "default" }}>
            🎁
          </Typography>
        </Tooltip>
      )}

      {resolved && (
        <Tooltip title={resolved.description} arrow>
          <Typography
            fontSize="sm"
            sx={{
              fontWeight: 500,
              px: 0.5,
              cursor: "default",
              whiteSpace: "nowrap",
            }}
          >
            {resolvedItemCount} {resolved.icon}
          </Typography>
        </Tooltip>
      )}

      {shared && (
        <Tooltip title={shared.description} arrow>
          <Typography
            fontSize="sm"
            sx={{
              fontWeight: 500,
              px: 0.5,
              cursor: "default",
              whiteSpace: "nowrap",
            }}
          >
            {shareCount} {shared.icon}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};

export default PreviewBadge;
