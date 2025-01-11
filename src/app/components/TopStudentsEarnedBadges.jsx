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

const TopStudentsEarnedBadges = ({ users }) => {
  // Sort users by badge count
  const sortedUsers = users
    .map((user) => ({
      ...user,
      resolvedFoundItemsCount: user.resolvedItemCount,
    }))
    .sort((a, b) => b.resolvedFoundItemsCount - a.resolvedFoundItemsCount);

  // Assign ranks using the average rank method for ties
  const rankedUsers = [];
  let currentRank = 1;

  for (let i = 0; i < sortedUsers.length; i++) {
    const start = i;

    // Check for ties
    while (
      i + 1 < sortedUsers.length &&
      sortedUsers[i].resolvedFoundItemsCount ===
        sortedUsers[i + 1].resolvedFoundItemsCount
    ) {
      i++;
    }

    // Calculate the average rank for tied users
    const end = i;
    const averageRank = (start + 1 + end + 1) / 2;

    for (let j = start; j <= end; j++) {
      rankedUsers.push({ ...sortedUsers[j], rank: averageRank });
    }

    currentRank = end + 2; // Update the rank for the next group
  }

  return (
    <>
      <Typography level="h3" gutterBottom>
        Top Finders
      </Typography>
      <Card
        sx={{
          height: "300px", // Reduced height
          borderTop: "3px solid #3f51b5",
          fontSize: "0.875rem", // Adjust font size for compactness
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "8px", // Reduced padding
          }}
        >
          <TableContainer sx={{ flex: 1, overflowY: "auto", maxHeight: 250 }}>
            <Table stickyHeader size="small">
              {" "}
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "60px" }}>
                    <strong>Rank</strong>
                  </TableCell>
                  <TableCell sx={{ width: "200px" }}>
                    <strong>Student Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Count</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankedUsers.slice(0, 10).map((user) => {
                  // Determine the color based on rank
                  const rank = Math.floor(user.rank);
                  const color =
                    rank === 1
                      ? "#FFD700" // Gold
                      : rank === 2
                      ? "#C0C0C0" // Silver
                      : rank === 3
                      ? "#CD7F32" // Bronze
                      : "inherit";

                  return (
                    <TableRow key={user._id}>
                      <TableCell
                        sx={{ fontWeight: "bold", color: color, width: "60px" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 25, // Smaller circle
                            height: 25,
                            borderRadius: "50%",
                            border: "1px solid black",
                            backgroundColor:
                              color === "inherit" ? "transparent" : color,
                            color: "#000000",
                            fontSize: "0.75rem", // Smaller text
                          }}
                        >
                          {Number.isInteger(user.rank)
                            ? user.rank
                            : user.rank.toFixed(1)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ width: "200px" }}>
                        {user.firstname} {user.lastname}
                      </TableCell>
                      <TableCell>{user.resolvedFoundItemsCount}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default TopStudentsEarnedBadges;
