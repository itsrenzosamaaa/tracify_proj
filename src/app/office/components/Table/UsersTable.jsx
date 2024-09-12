import { Table, Input, Button } from "@mui/joy";
import {
  Paper,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import React from "react";
import Link from "next/link";

const users = [
  { role: "Student", id: "C-2021-0001", name: "John Doe", email: "john@example.com" },
  { role: "Teacher", id: "T-2021-0001", name: "Jane Doe", email: "jane@example.com" },
  { role: "Janitor", id: "J-2021-0001", name: "Jim Smith", email: "jim@example.com" },
  { role: "Student", id: "C-2021-0002", name: "John Doe", email: "john@example.com" },
  { role: "Teacher", id: "T-2021-0002", name: "Jane Doe", email: "jane@example.com" },
  { role: "Janitor", id: "J-2021-0002", name: "Jim Smith", email: "jim@example.com" },
];

const UsersTable = () => {
  return (
    <TableContainer
      component={Paper}
      elevation={2}
      sx={{
        borderRadius: 2,
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <Table
        variant="outlined"
        sx={{
          tableLayout: "fixed", // Ensures the table obeys width settings
          minWidth: 650,
          "@media (max-width: 600px)": {
            minWidth: "100%", // Adjust width for small screens
          },
        }}
      >
        <TableHead>
          <TableRow>
            {["ID", "Name", "Role", "Actions"].map((header) => (
              <TableCell
                key={header}
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  padding: "0.5rem", // Reduce padding to avoid overflow
                  width: header === "ID" ? { xs: "30%" } : "50%",
                  display:
                    header === "Role"
                      ? { xs: "none", lg: "table-cell" }
                      : "table-cell",
                  whiteSpace: "nowrap", // Prevent text wrapping
                  overflow: "hidden",
                  textOverflow: "ellipsis", // Shorten overflowing text
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <Input
                placeholder="ID"
                size="small"
                sx={{ padding: { xs: "0.5rem", lg: "1rem" } }}
              />
            </TableCell>
            <TableCell sx={{ width: { xs: '10%', lg: '100%' } }}>
              <Input
                placeholder="Name"
                size="small"
                sx={{ padding: { xs: "0.5rem", lg: "1rem" } }}
              />
            </TableCell>
            {/* Adjusted Role Input */}
            <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
              <Input
                placeholder="Role"
                size="small"
                sx={{
                  padding: { xs: "0.5rem", lg: "1rem" },
                  width: "100%", // Ensure full width
                  boxSizing: "border-box", // Ensure padding doesn't affect width
                }}
              />
            </TableCell>
            <TableCell sx={{ padding: "0.5rem" }}></TableCell>
          </TableRow>

          {/* Data Row */}
          {users.map((user) => {
            return (
              <TableRow key={user.id}>
                <TableCell sx={{ padding: "0.5rem" }}>{user.id}</TableCell>
                <TableCell sx={{ padding: "0.5rem" }}>{user.name}</TableCell>
                <TableCell
                  sx={{
                    padding: "0.5rem",
                    display: { xs: "none", lg: "table-cell" },
                  }}
                >
                  {user.role}
                </TableCell>
                <TableCell sx={{ padding: "0.5rem" }}>
                  <Button component={Link} href={`/office/users/${user.id}`} sx={{ display: { xs: "none", lg: "block" }, width: { lg: '7rem' } }}>
                    View Profile
                  </Button>
                  <Button component={Link} href={`/office/users/${user.id}`} sx={{ display: { xs: "block", lg: "none" }, width: { xs: '3.5rem' } }}>
                    <PersonSearchIcon />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTable;
