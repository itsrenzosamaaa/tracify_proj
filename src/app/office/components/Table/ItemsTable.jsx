'use client';

import React, { useState } from "react";
import { Input, Table, Box, Button } from "@mui/joy";
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

const TableComponent = ({ items, onAddItem }) => {
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
        <AddItem onAddItem={onAddItem} />
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
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5", width: { xs: '20%' } }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5", display: { xs: 'none', lg: 'table-cell' } }}>Item</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5", display: { xs: 'none', lg: 'table-cell' } }}>Category</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5", width: { xs: '30%', lg: '20%' } }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  <MoreDetailsModal
                    isFoundItem={item.isFoundItem}
                    reportedByNotUser={item.reportedByNotUser}
                    status={item.status}
                    id={item._id}
                    name={item.name}
                    category={item.category}
                    location={item.location}
                    date={item.date}
                    time={item.time}
                    image={item.image}
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

export default TableComponent;
