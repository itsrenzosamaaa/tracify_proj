"use client";

import React from "react";
import { Box, Tooltip, Typography } from "@mui/joy";
import dayjs from "dayjs";
import GroupsIcon from "@mui/icons-material/Groups";

const PreviewBadge = ({ resolvedItemCount, shareCount, birthday, inherit }) => {
  const isBirthdayToday =
    birthday && dayjs(birthday).format("MM-DD") === dayjs().format("MM-DD");

  const getResolvedSymbol = () => {
    if (resolvedItemCount >= 20)
      return {
        icon: "⭐",
        description: "Legendary Finder — returned 20+ items.",
      };
    if (resolvedItemCount >= 10)
      return { icon: "⭐", description: "Top Resolver — returned 10+ items." };
    if (resolvedItemCount >= 5)
      return { icon: "⭐", description: "Amateur Solver — returned 5+ items." };
    if (resolvedItemCount >= 1)
      return { icon: "⭐", description: "Rookie Seeker — resolved 1 item." };
    return null;
  };

  const getShareSymbol = () => {
    if (shareCount >= 20)
      return { description: "Master Broadcaster — shared 20+ posts." };
    if (shareCount >= 10)
      return { description: "Top Sharer — shared 10+ posts." };
    if (shareCount >= 5)
      return { description: "Amateur Sharer — shared 5+ posts." };
    if (shareCount >= 1)
      return { description: "Rookie Sharer — shared 1 post." };
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
        gap: 0.5,
        backgroundColor: inherit ? "transparent" : "#f5f5f5",
        px: 0.5,
        py: 0.25,
        borderRadius: 6,
      }}
    >
      {/* ⭐ Resolved Badge */}
      {resolved && (
        <Tooltip title={resolved.description} arrow>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              px: 0.5,
              py: 0.2,
              fontSize: "0.675rem",
              height: 22,
              lineHeight: 1,
            }}
          >
            <Typography fontSize="xs" sx={{ fontWeight: 500 }}>
              {resolvedItemCount}
            </Typography>
            <Typography fontSize="xs">{resolved.icon}</Typography>
          </Box>
        </Tooltip>
      )}

      {/* 👥 Sharer Badge */}
      {shared && (
        <Tooltip title={shared.description} arrow>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              px: 0.5,
              py: 0.2,
              fontSize: "0.675rem",
              height: 22,
              lineHeight: 1,
            }}
          >
            <Typography fontSize="xs" sx={{ fontWeight: 500 }}>
              {shareCount}
            </Typography>
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#1976d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <GroupsIcon sx={{ fontSize: 10 }} />
            </Box>
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default PreviewBadge;
