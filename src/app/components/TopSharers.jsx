import React from "react";
import { Typography, Table, Box, Tooltip } from "@mui/joy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Card,
  CardContent,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

const TopSharers = ({ users, session }) => {
  const loggedInUserEmail = session?.user?.email;
  const userPermissions = session?.user?.permissions || [];
  const canViewRankings = userPermissions.includes("View Rankings");

  // Filter users with at least 3 shares
  const rankedUsers = users
    .map((user) => ({
      ...user,
      sharedCount: user.shareCount || 0,
    }))
    .filter((user) => user.sharedCount >= 3)
    .sort((a, b) => b.sharedCount - a.sharedCount);

  // ✅ Assign integer-only ranks with skipped numbers for ties
  const rankedUsersWithRanks = [];
  let currentRank = 1;

  for (let i = 0; i < rankedUsers.length; ) {
    const sameCount = rankedUsers[i].sharedCount;
    const sameRankUsers = rankedUsers.filter(
      (u) => u.sharedCount === sameCount
    );

    sameRankUsers.forEach((user) =>
      rankedUsersWithRanks.push({ ...user, rank: currentRank })
    );

    currentRank += sameRankUsers.length;
    i += sameRankUsers.length;
  }

  const loggedInUser = rankedUsersWithRanks.find(
    (user) => user.emailAddress === loggedInUserEmail
  );

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
          Top Sharers
        </Typography>
        <Tooltip
          title={
            <>
              Only the shared posts that have been resolved <br />
              will be counted in the leaderboards.
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
                        <strong>Share Count</strong>
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
                            sx={{
                              fontWeight: "bold",
                              color: color,
                              width: "60px",
                            }}
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
                          <TableCell>{user.sharedCount}</TableCell>
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

export default TopSharers;
