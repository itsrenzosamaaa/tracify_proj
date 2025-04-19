"use client";

import React, { useState } from "react";
import {
  Grid,
  Box,
  FormControl,
  FormLabel,
  Chip,
  RadioGroup,
  Radio,
  Button,
  Select,
  Option,
  Input,
  Snackbar,
  IconButton,
  Typography,
} from "@mui/joy";
import { Paper, Badge, useMediaQuery, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ItemsTable from "./Table/ItemsTable";
import PublishLostItem from "./Modal/PublishLostItems";
import TitleBreadcrumbs from "./Title/TitleBreadcrumbs";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Refresh, Search } from "@mui/icons-material";

const LostItemsList = ({
  owners,
  fetchItems,
  session,
  locationOptions,
  isFetchingItems,
  setOpenSnackbar,
  setMessage,
}) => {
  const [status, setStatus] = useState("Missing");
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const activeStatuses = ["Missing", "Request"];
  const archivedStatuses = ["Claimed", "Declined", "Canceled"];

  const statusCounts = [...activeStatuses, ...archivedStatuses].reduce(
    (acc, currentStatus) => {
      acc[currentStatus] = owners.filter(
        (owner) => owner.item.status === currentStatus
      ).length;
      return acc;
    },
    {}
  );

  const filteredItems = owners.filter((owner) => {
    const item = owner.item;
    const matchesStatus = item?.status === status;
    const matchesSearch =
      item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner?.user?.firstname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      owner?.user?.lastname.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <TitleBreadcrumbs title="List of Lost Items" text="Lost Items" />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper
            elevation={2}
            sx={{ padding: "1rem", borderTop: "3px solid #3f51b5" }}
          >
            <Box
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <FormControl>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FormLabel sx={{ mb: 0 }}>Filter by Status</FormLabel>
                  <IconButton
                    size="small"
                    onClick={() => fetchItems()}
                    sx={{ p: 0.5, mt: "-2px" }}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                  {isMobile ? (
                    <Select
                      value={status}
                      onChange={(e, newValue) => {
                        setStatus(newValue);
                        setCurrentPage(1);
                      }}
                      size="sm"
                    >
                      {[...activeStatuses, ...archivedStatuses].map((name) => (
                        <Option key={name} value={name}>
                          {name} ({statusCounts[name] || 0})
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <RadioGroup
                      name="status-selection"
                      aria-labelledby="status-selection"
                      orientation="horizontal"
                      sx={{ display: "flex", gap: 1 }}
                    >
                      {/* Active Statuses */}
                      {activeStatuses.map((name) => {
                        const checked = status === name;
                        const itemCount = statusCounts[name];

                        const chipContent = (
                          <Chip
                            key={name}
                            variant="plain"
                            color={checked ? "primary" : "neutral"}
                            onClick={() => setStatus(name)}
                            sx={{ cursor: "pointer" }}
                          >
                            <Radio
                              variant="outlined"
                              color={checked ? "primary" : "neutral"}
                              disableIcon
                              overlay
                              label={name}
                              value={name}
                              checked={checked}
                              onChange={(event) => {
                                if (event.target.checked) setStatus(name);
                              }}
                            />
                          </Chip>
                        );

                        return itemCount > 0 ? (
                          <Badge
                            key={name}
                            badgeContent={itemCount}
                            color="error"
                          >
                            {chipContent}
                          </Badge>
                        ) : (
                          <React.Fragment key={name}>
                            {chipContent}
                          </React.Fragment>
                        );
                      })}

                      {/* Divider */}
                      <Typography
                        level="body-sm"
                        sx={{ mx: 1, fontWeight: 600, color: "#888" }}
                      >
                        |
                      </Typography>

                      {/* Archived Statuses */}
                      {archivedStatuses.map((name) => {
                        const checked = status === name;
                        const itemCount = statusCounts[name];

                        const chipContent = (
                          <Chip
                            key={name}
                            variant="plain"
                            color={checked ? "primary" : "neutral"}
                            onClick={() => setStatus(name)}
                            sx={{ cursor: "pointer" }}
                          >
                            <Radio
                              variant="outlined"
                              color={checked ? "primary" : "neutral"}
                              disableIcon
                              overlay
                              label={name}
                              value={name}
                              checked={checked}
                              onChange={(event) => {
                                if (event.target.checked) setStatus(name);
                              }}
                            />
                          </Chip>
                        );

                        return itemCount > 0 ? (
                          <Badge
                            key={name}
                            badgeContent={itemCount}
                            color="error"
                          >
                            {chipContent}
                          </Badge>
                        ) : (
                          <React.Fragment key={name}>
                            {chipContent}
                          </React.Fragment>
                        );
                      })}
                    </RadioGroup>
                  )}
                </Box>
              </FormControl>

              <Button
                size="small"
                startDecorator={<AddIcon />}
                onClick={() => setOpen(true)}
              >
                Post Lost Item
              </Button>

              <PublishLostItem
                open={open}
                onClose={() => setOpen(false)}
                fetchItems={fetchItems}
                setOpenSnackbar={setOpenSnackbar}
                setMessage={setMessage}
                locationOptions={locationOptions}
              />
            </Box>

            <Input
              startDecorator={<Search />}
              sx={{ mb: 3, width: isMobile ? "100%" : "30%" }}
              placeholder="Search for items"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {!isFetchingItems ? (
              <ItemsTable
                locationOptions={locationOptions}
                session={session}
                items={filteredItems}
                fetchItems={fetchItems}
                isFoundItem={false}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setOpenSnackbar={setOpenSnackbar}
                setMessage={setMessage}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <Typography level="title-md">Loading items...</Typography>
                <CircularProgress size={28} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default LostItemsList;
