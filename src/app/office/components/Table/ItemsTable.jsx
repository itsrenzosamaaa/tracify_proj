"use client";

import React, { useState } from "react";
import { Input, Table, Box, Chip, Button } from "@mui/joy";
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
import MoreDetailsModal from "../Modals/MoreDetailsModal";
import AddItem from "../Dropdown/AddItem";

// const prefixFound = "FI-";
// const prefixLost = "LI-";

// const stats = [
//   { status: "Validating", color: "#FFC107", fontColor: "#000000" },
//   { status: "Published", color: "#4CAF50", fontColor: "#FFFFFF" },
//   { status: "Reserved", color: "#2196F3", fontColor: "#FFFFFF" },
//   { status: 'Cleared', color: '#4CAF50', fontColor: "#FFFFFF" },
// ];

const TableComponent = ({ items }) => {
  const [itemCategory, setItemCategory] = useState(true);

  // const filteredRows = data.filter((item) => item.isFoundItem === itemCategory);

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
          <FormLabel sx={{ fontSize: { sx: '0.5rem' } }}>Choose Category</FormLabel>
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
              sx={{ fontSize: { sx: '0.5rem', lg: '1rem' } }}
            />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label="Lost Items"
              sx={{ fontSize: { sx: '0.5rem', lg: '1rem' } }}
            />
          </RadioGroup>
        </FormControl>
        <AddItem />
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
                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5", width: { xs: '20%' } }}
              >
                ID
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5", display: { xs: 'none', lg: 'table-cell' } }}
              >
                Item
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5", display: { xs: 'none', lg: 'table-cell' } }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5", width: { xs: '30%', lg: '20%' } }}
              >
                Status
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
              <TableCell>
                <Input
                  placeholder="ID"
                  size="small"
                  sx={{ padding: { xs: "0.5rem", lg: "1rem" } }}
                />
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                <Input
                  placeholder="Item"
                  size="small"
                  sx={{ padding: { xs: "0.5rem", lg: "1rem" } }}
                />
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                <Input
                  placeholder="Category"
                  size="small"
                  sx={{ padding: { xs: "0.5rem", lg: "1rem" } }}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Status"
                  size="small"
                  sx={{ padding: { xs: "0.5rem", lg: "1rem" } }}
                />
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            {items.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item._id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="solid">Details</Button>
                </TableCell>
              </TableRow>
            ))}
            {/* {filteredRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ padding: "0.5rem" }}>{row.id}</TableCell>
                <TableCell sx={{ padding: "0.5rem", display: { xs: 'none', lg: 'table-cell' } }}>{row.name}</TableCell>
                <TableCell sx={{ padding: "0.5rem", display: { xs: 'none', lg: 'table-cell' } }}>{row.category}</TableCell>
                <TableCell sx={{ padding: "0.5rem" }}>
                  {stats.map((chi) =>
                    row.status === chi.status ? (
                      <Chip
                        variant="solid"
                        sx={{
                          backgroundColor: chi.color,
                          color: chi.fontColor,
                          "--Chip-minHeight": { lg: "35px", xs: "15px" },
                          "--Chip-paddingInline": { lg: "25px", xs: "12px" },
                          xs: {
                            "--Chip-minHeight": "15px",
                            "--Chip-paddingInline": "12px",
                          },
                        }}
                        key={chi.status}
                      >
                        {chi.status}
                      </Chip>
                    ) : null
                  )}
                </TableCell>
                <TableCell>
                  <MoreDetailsModal
                    nya={false}
                    isFoundItem={row.isFoundItem}
                    status={row.status}
                    id={row.id}
                    name={row.name}
                    category={row.category}
                    location={row.location}
                    date={row.date}
                    time={row.time}
                  />
                </TableCell>
              </TableRow>
            ))} */}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TableComponent;
