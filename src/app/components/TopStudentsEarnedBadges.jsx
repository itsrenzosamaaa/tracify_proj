import React from "react";
import { Typography, Table, Box, Tooltip } from "@mui/joy";
import {
  Card,
  CardContent,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const TopStudentsEarnedBadges = ({ users, session }) => {
  const userPermissions = session?.user?.permissions || [];
  const canViewRankings = userPermissions.includes("View Rankings");

  const rankedUsers = users
    .map((user) => ({
      ...user,
      resolvedFoundItemsCount: user.resolvedItemCount || 0,
    }))
    .filter((user) => user.resolvedFoundItemsCount >= 2)
    .sort((a, b) => b.resolvedFoundItemsCount - a.resolvedFoundItemsCount);

  // Assign integer-only ranks with skip logic for ties
  const rankedUsersWithRanks = [];
  let currentRank = 1;

  for (let i = 0; i < rankedUsers.length; i++) {
    const sameRankCount = rankedUsers.filter(
      (u) =>
        u.resolvedFoundItemsCount === rankedUsers[i].resolvedFoundItemsCount
    ).length;

    const alreadyRanked = rankedUsersWithRanks.some(
      (u) =>
        u.resolvedFoundItemsCount === rankedUsers[i].resolvedFoundItemsCount
    );

    if (!alreadyRanked) {
      const sameRankUsers = rankedUsers.filter(
        (u) =>
          u.resolvedFoundItemsCount === rankedUsers[i].resolvedFoundItemsCount
      );
      sameRankUsers.forEach((u) =>
        rankedUsersWithRanks.push({ ...u, rank: currentRank })
      );
      currentRank += sameRankCount;
    }
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
        }}
      >
        <Typography level="h3" gutterBottom>
          Top Finders
        </Typography>
        <Tooltip
          title={
            <>
              Only the resolved items will be <br /> counted in the
              leaderboards.
            </>
          }
          placement="top"
          size="sm"
        >
          <InfoOutlinedIcon sx={{ fontSize: "20px" }} />
        </Tooltip>
      </Box>

      <Card
        sx={{
          height: "425px",
          borderTop: "3px solid #3f51b5",
          fontSize: "0.875rem",
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "8px",
          }}
        >
          <TableContainer
            sx={{
              flex: 1,
              overflowY: "auto",
              maxHeight: 425,
              position: "relative",
            }}
          >
            {canViewRankings ? (
              rankedUsersWithRanks.length > 0 ? (
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "80px" }}>
                        <strong>Rank</strong>
                      </TableCell>
                      <TableCell sx={{ width: "40%" }}>
                        <strong>Student Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Resolved Items</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rankedUsersWithRanks.slice(0, 10).map((user) => {
                      const rank = user.rank;
                      const color =
                        rank === 1
                          ? "#FFD700"
                          : rank === 2
                          ? "#C0C0C0"
                          : rank === 3
                          ? "#CD7F32"
                          : "inherit";

                      return (
                        <TableRow key={user._id} sx={{ height: "35px" }}>
                          <TableCell
                            sx={{ fontWeight: "bold", color, width: "60px" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 25,
                                height: 25,
                                borderRadius: "50%",
                                border: "1px solid black",
                                backgroundColor:
                                  color === "inherit" ? "transparent" : color,
                                color: "#000000",
                                fontSize: "0.75rem",
                              }}
                            >
                              {rank}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ width: "150px" }}>
                            {user.firstname} {user.lastname}
                          </TableCell>
                          <TableCell>{user.resolvedFoundItemsCount}</TableCell>
                        </TableRow>
                      );
                    })}

                    {Array.from({
                      length: Math.max(0, 10 - rankedUsersWithRanks.length),
                    }).map((_, index) => (
                      <TableRow
                        key={`empty-row-${index}`}
                        sx={{ height: "35px" }}
                      >
                        <TableCell colSpan={3}></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "300px",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    level="body2"
                    color="textSecondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    No data available!
                  </Typography>
                </Box>
              )
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "300px",
                  textAlign: "center",
                }}
              >
                <Typography
                  level="body2"
                  color="textSecondary"
                  sx={{ fontStyle: "italic" }}
                >
                  You do not have permission to view this section.
                </Typography>
              </Box>
            )}
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default TopStudentsEarnedBadges;
