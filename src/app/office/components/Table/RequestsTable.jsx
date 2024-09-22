"use client";

import { Table, Box, Input } from "@mui/joy";
import {
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import React, { useState } from "react";
import RequestDetailsModal from "../Modals/RequestDetailsModal";

// const prefixFound = "FI-";
// const prefixLost = "LI-";

// const data = [
//   {
//     isFoundItem: true,
//     id: prefixFound + String(11).padStart(4, "0"),
//     name: "Wallet",
//     category: "Accessories",
//     location: "RLO Building 3rd Floor",
//     date: "09-21-2024",
//     time: "1:00PM",
//   },
//   {
//     isFoundItem: true,
//     id: prefixFound + String(12).padStart(4, "0"),
//     name: "Keys",
//     category: "Accessories",
//     location: "RLO Building 3rd Floor",
//     date: "09-21-2024",
//     time: "1:00PM",
//   },
//   {
//     isFoundItem: true,
//     id: prefixFound + String(13).padStart(4, "0"),
//     name: "Charger",
//     category: "Electronics",
//     location: "RLO Building 3rd Floor",
//     date: "09-21-2024",
//     time: "1:00PM",
//   },
//   {
//     isFoundItem: true,
//     id: prefixFound + String(14).padStart(4, "0"),
//     name: "Airpods",
//     category: "Electronics",
//     location: "RLO Building 3rd Floor",
//     date: "09-21-2024",
//     time: "1:00PM",
//   },
//   {
//     isFoundItem: true,
//     id: prefixFound + String(15).padStart(4, "0"),
//     name: "T-Shirt",
//     category: "Clothing",
//     location: "RLO Building 3rd Floor",
//     date: "09-21-2024",
//     time: "1:00PM",
//   },
//   {
//     isFoundItem: false,
//     id: prefixLost + String(16).padStart(4, "0"),
//     name: "T-Shirt",
//     category: "Clothing",
//     location: "RLO Building 3rd Floor",
//     date: "09-21-2024",
//     time: "1:00PM",
//   },
//   {
//     isFoundItem: false,
//     id: prefixLost + String(17).padStart(4, "0"),
//     name: "T-Shirt",
//     category: "Clothing",
//     location: "RLO Building 3rd Floor",
//     date: "09-21-2024",
//     time: "1:00PM",
//   },
//   {
//     isFoundItem: false,
//     id: prefixLost + String(18).padStart(4, "0"),
//     name: "T-Shirt",
//     category: "Clothing",
//     location: "RLO Building 3rd Floor",
//     date: "09-21-2024",
//     time: "1:00PM",
//   },
//   {
//     isFoundItem: false,
//     id: prefixLost + String(19).padStart(4, "0"),
//     name: "T-Shirt",
//     category: "Clothing",
//     location: "RLO Building 3rd Floor",
//     date: "09-21-2024",
//     time: "1:00PM",
//   },
//   {
//     isFoundItem: false,
//     id: prefixLost + String(20).padStart(4, "0"),
//     name: "T-Shirt",
//     category: "Clothing",
//     location: "RLO Building 3rd Floor",
//     date: "09-21-2024",
//     time: "1:00PM",
//   },
// ];

const RequestsTable = ({items}) => {
  const [itemCategory, setItemCategory] = useState(true);

  const filteredRows = items.filter((item) => item.isFoundItem === itemCategory);

  return (
    <Paper elevation={2}>
      <Box
        sx={{
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <FormControl>
          <FormLabel>Choose Category</FormLabel>
          <RadioGroup
            row
            aria-labelledby="category-selection"
            name="category"
            value={itemCategory.toString()}
            onChange={(e) => setItemCategory(e.target.value === "true")}
          >
            <FormControlLabel
              value="true"
              control={<Radio />}
              label="Found Items"
            />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label="Lost Items"
            />
          </RadioGroup>
        </FormControl>
      </Box>
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        <Table
          variant="outlined"
          sx={{
            minWidth: 650,
            borderCollapse: "collapse",
            "@media (max-width: 600px)": {
              minWidth: 600,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  width: { xs: "20%" },
                }}
              >
                ID
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  width: { xs: "30%", lg: "20%" },
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  display: { xs: "none", lg: "table-cell" },
                }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{ padding: "0.5rem", width: { xs: "30%", lg: "20%" } }}
              >
                <Input
                  placeholder="ID"
                  size="small"
                  sx={{ padding: { xs: "0.5rem", lg: "1rem" } }}
                />
              </TableCell>
              <TableCell
                sx={{ padding: "0.5rem", width: { xs: "30%", lg: "20%" } }}
              >
                <Input
                  placeholder="Name"
                  size="small"
                  sx={{ padding: { xs: "0.5rem", lg: "1rem" } }}
                />
              </TableCell>
              <TableCell
                sx={{
                  padding: "0.5rem",
                  display: { xs: "none", lg: "table-cell" },
                }}
              >
                <Input
                  placeholder="Category"
                  size="small"
                  sx={{ padding: { xs: "0.5rem", lg: "1rem" } }}
                />
              </TableCell>
              <TableCell sx={{ padding: "0.5rem" }}></TableCell>
            </TableRow>
            {filteredRows.map((row) => (
              <TableRow key={row._id}>
                <TableCell sx={{ padding: "0.5rem" }}>{row.id}</TableCell>
                <TableCell
                  sx={{ padding: "0.5rem", width: { xs: "30%", lg: "20%" } }}
                >
                  {row.name}
                </TableCell>
                <TableCell
                  sx={{
                    padding: "0.5rem",
                    display: { xs: "none", lg: "table-cell" },
                  }}
                >
                  {row.category}
                </TableCell>
                <TableCell sx={{ padding: "0.5rem" }}>
                  <RequestDetailsModal
                    nya={false}
                    isFoundItem={row.isFoundItem}
                    id={row._id}
                    name={row.name}
                    category={row.category}
                    location={row.location}
                    date={row.date}
                    time={row.time}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RequestsTable;
