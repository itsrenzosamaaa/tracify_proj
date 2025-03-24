import React from "react";
import { Typography, Table, Box } from "@mui/joy";
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
  const userPermissions = session?.user?.permissions || []; // Ensure it's an array

  // ✅ Check if user has permission
  const canViewRankings = userPermissions.includes("View Rankings");

  // Include only users who have at least 3 shares
  const rankedUsers = users
    .map((user) => ({
      ...user,
      sharedCount: user.shareCount,
    }))
    // .filter((user) => user.sharedCount >= 3)
    .sort((a, b) => b.sharedCount - a.sharedCount);

  // ✅ Assign ranks using the average rank method for ties
  const rankedUsersWithRanks = [];
  let currentRank = 1;

  for (let i = 0; i < rankedUsers.length; i++) {
    const start = i;
    while (
      i + 1 < rankedUsers.length &&
      rankedUsers[i].sharedCount === rankedUsers[i + 1].sharedCount
    ) {
      i++;
    }

    const end = i;
    const averageRank = (start + 1 + end + 1) / 2;

    for (let j = start; j <= end; j++) {
      rankedUsersWithRanks.push({ ...rankedUsers[j], rank: averageRank });
    }

    currentRank = end + 2; // Update the rank for the next group
  }

  // ✅ Find logged-in user's rank
  const loggedInUser = rankedUsersWithRanks.find(
    (user) => user.emailAddress === loggedInUserEmail
  );

  return (
    <>
      <Typography level="h3" gutterBottom>
        Top Sharers
      </Typography>

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
            {/* ✅ Handle permission check before rendering */}
            {canViewRankings ? (
              rankedUsersWithRanks.length > 0 ? (
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "80px" }}>
                        <strong>Rank</strong>
                      </TableCell>
                      <TableCell sx={{  width: "40%" }}>
                        <strong>Student Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Count</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rankedUsersWithRanks.slice(0, 10).map((user) => {
                      const rank = Math.floor(user.rank);
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
                              {Number.isInteger(user.rank)
                                ? user.rank
                                : user.rank.toFixed(1)}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ width: "150px" }}>
                            {user.firstname} {user.lastname}
                          </TableCell>
                          <TableCell>{user.sharedCount}</TableCell>
                        </TableRow>
                      );
                    })}

                    {/* Fill empty rows to maintain consistent height */}
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
