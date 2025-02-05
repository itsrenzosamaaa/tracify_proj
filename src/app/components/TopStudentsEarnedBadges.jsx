import React from "react";
import { Typography, Table, Box, CircularProgress } from "@mui/joy";
import {
  Card,
  CardContent,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
} from "@mui/material";

const TopStudentsEarnedBadges = ({ users, session }) => {
  const loggedInUserEmail = session?.user?.email;

  // Include all users in the ranking
  const rankedUsers = users
    .map((user) => ({
      ...user,
      resolvedFoundItemsCount: user.resolvedItemCount, // Keep original count
    }))
    .filter((user) => user.resolvedFoundItemsCount >= 2) // Exclude users with count < 2
    .sort((a, b) => b.resolvedFoundItemsCount - a.resolvedFoundItemsCount);

  // Assign ranks using the average rank method for ties
  const rankedUsersWithRanks = [];
  let currentRank = 1;

  for (let i = 0; i < rankedUsers.length; i++) {
    const start = i;

    // Check for ties
    while (
      i + 1 < rankedUsers.length &&
      rankedUsers[i].resolvedFoundItemsCount ===
        rankedUsers[i + 1].resolvedFoundItemsCount
    ) {
      i++;
    }

    // Calculate the average rank for tied users
    const end = i;
    const averageRank = (start + 1 + end + 1) / 2;

    for (let j = start; j <= end; j++) {
      rankedUsersWithRanks.push({ ...rankedUsers[j], rank: averageRank });
    }

    currentRank = end + 2; // Update the rank for the next group
  }

  // Find the logged-in user's rank
  const loggedInUser = rankedUsersWithRanks.find(
    (user) => user.emailAddress === loggedInUserEmail
  );

  return (
    <>
      <Typography level="h3" gutterBottom>
        Top Finders
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
            {rankedUsersWithRanks.length !== 0 ? (
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "60px" }}>
                      <strong>Rank</strong>
                    </TableCell>
                    <TableCell sx={{ width: "150px" }}>
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
                        <TableCell>{user.resolvedFoundItemsCount}</TableCell>
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
                <TableFooter>
                  {loggedInUser && session?.user?.userType === "user" && (
                    <TableRow
                      sx={{
                        position: "sticky",
                        bottom: 0,
                        backgroundColor: "white",
                        borderTop: "1px solid #e0e0e0",
                      }}
                    >
                      {/* Display the user's rank */}
                      <TableCell
                        sx={{
                          fontWeight: "bold",
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
                              Math.floor(loggedInUser.rank) === 1
                                ? "#FFD700"
                                : Math.floor(loggedInUser.rank) === 2
                                ? "#C0C0C0"
                                : Math.floor(loggedInUser.rank) === 3
                                ? "#CD7F32"
                                : "inherit",
                            color: "#000000",
                            fontSize: "0.75rem",
                          }}
                        >
                          {Number.isInteger(loggedInUser.rank)
                            ? loggedInUser.rank
                            : loggedInUser.rank.toFixed(1)}
                        </Box>
                      </TableCell>

                      {/* Display the user's name */}
                      <TableCell sx={{ width: "200px" }}>
                        {loggedInUser.firstname} {loggedInUser.lastname}
                      </TableCell>

                      {/* Display the user's resolved found items count */}
                      <TableCell>
                        {loggedInUser.resolvedFoundItemsCount}
                      </TableCell>
                    </TableRow>
                  )}
                  {session?.user?.userType === "user" && (
                    <TableCell
                      colSpan={3}
                      sx={{ textAlign: "center", py: 2, height: "35px" }}
                    >
                      <Typography
                        level="p"
                        color="textSecondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        Not ranked yet – Keep resolving items to earn your rank!
                        🚀
                      </Typography>
                    </TableCell>
                  )}
                </TableFooter>
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
            )}
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default TopStudentsEarnedBadges;
